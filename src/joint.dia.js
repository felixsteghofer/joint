/*
 onelogic 29.05.2014

 backports of joint 0.8.1 functionality. Consider this on merges with newer joint version.
 */
// Command manager implements undo/redo functionality.
joint.dia.CommandManager = Backbone.Model.extend({

    defaults: {
        cmdBeforeAdd: null,
        cmdNameRegex: /^(?:add|remove|change:\w+)$/
    },

    // length of prefix 'change:' in the event name
    PREFIX_LENGTH: 7,

    initialize: function(options) {

        _.bindAll(this, 'initBatchCommand', 'storeBatchCommand');

        this.graph = options.graph;

        this.reset();
        this.listen();
    },

    listen: function() {

        this.listenTo(this.graph, 'all', this.addCommand, this);

        this.listenTo(this.graph, 'batch:start', this.initBatchCommand, this);
        this.listenTo(this.graph, 'batch:stop', this.storeBatchCommand, this);
    },

    createCommand: function(options) {

        var cmd = {
            action: undefined,
            data: { id: undefined, type: undefined, previous: {}, next: {}},
            batch: options && options.batch
        }

        return cmd;
    },

    addCommand: function(cmdName, cell, graph, options) {

        if (!this.get('cmdNameRegex').test(cmdName)) {
            return;
        }

        if (typeof this.get('cmdBeforeAdd') == 'function' && !this.get('cmdBeforeAdd').apply(this, arguments)) {
            return;
        }

        //TODO Felix bad hack. Change signal should not be tracked in commandManager stack
        if (cmdName == 'change:signal') {
            return;
        }

        var push = _.bind(function(cmd) {

            this.redoStack = [];

            if (!cmd.batch) {
                this.undoStack.push(cmd);
                this.trigger('add', cmd);
            } else {
                this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
                // Commands possible thrown away. Someone might be interested.
                this.trigger('batch', cmd);
            }

        }, this);

        var command = undefined;

        if (this.batchCommand) {
            // set command as the one used last.
            // in most cases we are working with same object, doing same action
            // etc. translate an object piece by piece
            command = this.batchCommand[Math.max(this.lastCmdIndex,0)];

            // Check if we are start working with new object or performing different action with it.
            // Note, that command is uninitialized when lastCmdIndex equals -1. (see 'initBatchCommand()')
            // in that case we are done, command we were looking for is already set
            if (this.lastCmdIndex >= 0 && (command.data.id !== cell.id || command.action !== cmdName)) {

                // trying to find command first, which was performing same action with the object
                // as we are doing now with cell
                command = _.find(this.batchCommand, function(cmd, index) {
                    this.lastCmdIndex = index;
                    return cmd.data.id === cell.id && cmd.action === cmdName;
                }, this);

                if (!command) {
                    // command with such an id and action was not found. Let's create new one
                    this.lastCmdIndex = this.batchCommand.push(this.createCommand({ batch:  true })) - 1;
                    command = _.last(this.batchCommand);
                }
            }

        } else {

            // single command
            command = this.createCommand();
            command.batch = false;

        }

        if (cmdName === 'add' || cmdName === 'remove') {

            command.action = cmdName;
            command.data.id = cell.id;
            command.data.type = cell.attributes.type;
            command.data.attributes = _.merge({}, cell.toJSON());
            command.options = options || {};

            return push(command);
        }

        // `changedAttribute` holds the attribute name corresponding
        // to the change event triggered on the model.
        var changedAttribute = cmdName.substr(this.PREFIX_LENGTH);

        if (!command.batch || !command.action) {
            // Do this only once. Set previous box and action (also serves as a flag so that
            // we don't repeat this branche).
            command.action = cmdName;
            command.data.id = cell.id;
            command.data.type = cell.attributes.type;
            command.data.previous[changedAttribute] = _.clone(cell.previous(changedAttribute));
            command.options = options || {};
        }

        command.data.next[changedAttribute] = _.clone(cell.get(changedAttribute));

        return push(command);
    },

    // Batch commands are those that merge certain commands applied in a row (1) and those that
    // hold multiple commands where one action consists of more than one command (2)
    // (1) This is useful for e.g. when the user is dragging an object in the paper which would
    // normally lead to 1px translation commands. Applying undo() on such commands separately is
    // most likely undesirable.
    // (2) e.g When you are removing an element, you don't want all links connected to that element, which
    // are also being removed to be part of different command

    initBatchCommand: function() {

        if (!this.batchCommand) {

            this.batchCommand = [this.createCommand({ batch:  true})];
            this.lastCmdIndex = -1;

            // batch level counts how many times has been initBatchCommand executed.
            // It is useful when we doing an operation recursively.
            this.batchLevel = 0;

        } else {

            // batch command is already active
            this.batchLevel++;
        }
    },

    storeBatchCommand: function() {

        // In order to store batch command it is necesary to run storeBatchCommand as many times as
        // initBatchCommand was executed
        if (this.batchCommand && this.batchLevel <= 0) {

            // checking if there is any valid command in batch
            // for example: calling `initBatchCommand` immediately followed by `storeBatchCommand`
            if (this.lastCmdIndex >= 0) {

                this.redoStack = [];

                this.undoStack.push(this.batchCommand);
                this.trigger('add', this.batchCommand);
            }

            delete this.batchCommand;
            delete this.lastCmdIndex;
            delete this.batchLevel;

        } else if (this.batchCommand && this.batchLevel > 0) {

            // low down batch command level, but not store it yet
            this.batchLevel--;
        }
    },

    revertCommand: function(command) {

        this.stopListening();

        var batchCommand;

        if (_.isArray(command)) {
            batchCommand = command;
        } else {
            batchCommand = [command];
        }

        for (var i = batchCommand.length - 1; i >= 0; i--)  {

            var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);

            switch (cmd.action) {

                case 'add':
                    cell.remove();
                    break;

                case 'remove':
                    this.graph.addCell(cmd.data.attributes);
                    break;

                default:
                    var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                    cell.set(attribute, cmd.data.previous[attribute]);
                    break;
            }

        }

        this.listen();
    },

    applyCommand: function(command) {

        this.stopListening();

        var batchCommand;

        if (_.isArray(command)) {
            batchCommand = command;
        } else {
            batchCommand = [command];
        }

        for (var i = 0; i < batchCommand.length; i++)  {

            var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);

            switch (cmd.action) {

                case 'add':
                    this.graph.addCell(cmd.data.attributes);
                    break;

                case 'remove':
                    cell.remove();
                    break;

                default:
                    var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                    cell.set(attribute, cmd.data.next[attribute]);
                    break;

            }

        }

        this.listen();
    },

    undo: function() {

        var command = this.undoStack.pop();

        if (command) {

            this.revertCommand(command);
            this.redoStack.push(command);
        }
    },


    redo: function() {

        var command = this.redoStack.pop();

        if (command) {

            this.applyCommand(command);
            this.undoStack.push(command);
        }
    },

    cancel: function() {

        if (this.hasUndo()) {

            this.revertCommand(this.undoStack.pop());
            this.redoStack = [];
        }
    },

    reset: function() {

        this.undoStack = [];
        this.redoStack = [];
    },

    hasUndo: function() {

        return this.undoStack.length > 0;
    },

    hasRedo: function() {

        return this.redoStack.length > 0;
    }
});

// Implements Clipboard for copy-pasting elements.
// Note that the clipboard is also able to copy elements and their assocaited links from one graph
// and paste them to another.

// Usage:

//       var selection = new Backbone.Collection;
//       var graph = new joint.dia.Graph;
//       // ... now something that adds elements to the selection ...
//       var clipboard = new joint.ui.Clipboard;
//       KeyboardJS.on('ctrl + c', function() { clipboard.copyElements(selection, graph); });
//       KeyboardJS.on('ctrl + v', function() { clipboard.pasteCells(graph); });


joint.ui.Clipboard = Backbone.Collection.extend({

    // `selection` is a Backbone collection containing elements that should be copied to the clipboard.
    // Note that with these elements, also all the associated links are copied. That's why we
    // also need the `graph` parameter, to find these links.
    // This function returns the elements and links from the original graph that were copied. This is useful
    // for implements the Cut operation where the original cells should be removed from the graph.
    // if `opt.translate` object with `dx` and `dy` properties is passed, the copied elements will
    // be translated by the specified amount. This is useful for e.g. the 'cut' operation where
    // we'd like to have the pasted elements moved by an offset to see they were pasted to the paper.
    // if `opt.useLocalStorage` is `true`, the copied elements will be saved to the localStorage
    // (if present) making it possible to copy-paste elements between browser tabs or sessions.
    copyElements: function(selection, graph, opt) {

        opt = opt || {};

        // The method:
        // 1. Find all links that have BOTH source and target in `this.selection`.
        // 2. Clone these links.
        // 3. Clone elements and map their original id to their new id and put them to the clipboard.
        // 4. Reset the target/source id of the cloned links to point to the appropriate cloned elements.
        // 5. Put the modified links to the clipboard too.

        var links = [];
        var elements = [];
        var elementsIdMap = {};

        selection.each(function(element) {

            var connectedLinks = graph.getConnectedLinks(element);

            // filter only those having both source/target in the selection.
            links = links.concat(_.filter(connectedLinks, function(link) {

                if (selection.get(link.get('source').id) && selection.get(link.get('target').id)) {
                    return true;
                }
                return false;

            }));

            var clonedElement = element.clone();
            if (opt.translate) {
                clonedElement.translate(opt.translate.dx || 20, opt.translate.dy || 20);
            }
            elements.push(clonedElement);
            elementsIdMap[element.get('id')] = clonedElement.get('id');

        });

        // Store the original links so that we can return them from the function together with the
        // original elements.
        var originalLinks = _.unique(links);

        links = _.map(originalLinks, function(link) {

            var clonedLink = link.clone();
            var source = clonedLink.get('source');
            var target = clonedLink.get('target');

            source.id = elementsIdMap[source.id];
            target.id = elementsIdMap[target.id];

            clonedLink.set({
                source: _.clone(source),
                target: _.clone(target)
            });

            // Translate vertices as well if necessary.
            if (opt.translate) {

                _.each(clonedLink.get('vertices'), function(vertex) {

                    vertex.x += opt.translate.dx || 20;
                    vertex.y += opt.translate.dy || 20;
                });
            }

            return clonedLink;
        });

        this.reset(elements.concat(links));

        if (opt.useLocalStorage && window.localStorage) {

            localStorage.setItem('joint.ui.Clipboard.cells', JSON.stringify(this.toJSON()));
        }

        return (selection.models || []).concat(originalLinks);
    },

    // `opt.link` is attributes that will be set all links before they are added to the `graph`.
    // This is useful for e.g. setting `z: -1` for links in order to always put them to the bottom of the paper.
    pasteCells: function(graph, opt) {

        opt = opt || {};

        if (opt.useLocalStorage && this.length === 0 && window.localStorage) {

            this.reset(JSON.parse(localStorage.getItem('joint.ui.Clipboard.cells')));
        }

        graph.trigger('batch:start');

        this.each(function(cell) {

            cell.unset('z');
            if ((cell instanceof joint.dia.Link) && opt.link) {

                cell.set(opt.link);
            }

            //TODO Felix do it right: return all pasted cells and let user dev choose how to manipulate the cell(s)
            var copiedCell = cell.toJSON();
            copiedCell.position.x += 50;
            copiedCell.position.y += 50;
            graph.addCell(copiedCell);

            return copiedCell;
        });

        graph.trigger('batch:stop');
    },

    clear: function() {

        this.reset([]);

        if (window.localStorage) {

            localStorage.removeItem('joint.ui.Clipboard.cells');
        }
    }
});

//this["joint"] = this["joint"] || {};
//this["joint"]["templates"] = this["joint"]["templates"] || {};

//this["joint"]["templates"]["freetransform.html"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
//this.compilerInfo = [4,'>= 1.0.0'];
//helpers = this.merge(helpers, Handlebars.helpers); data = data || {};



//return "<div class=\"resize\" data-position=\"top-left\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"top\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"top-right\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"right\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"bottom-right\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"bottom\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"bottom-left\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"left\" draggable=\"false\"/>\n<div class=\"rotate\" draggable=\"false\"/>\n\n";
//});
joint.ui.FreeTransform = Backbone.View.extend({

    className: 'free-transform',

    template: 'freetransform',

    events: {
        'mousedown .resize': 'startResizing',
        'mousedown .rotate': 'startRotating',
        'touchstart .resize': 'startResizing',
        'touchstart .rotate': 'startRotating'
    },

    options: {

        directions: ['nw','n','ne','e','se','s','sw','w']
    },

    initialize: function() {

        _.bindAll(this, 'update', 'remove', 'pointerup', 'pointermove');

        // inform an existing halo that a new halo is being created
        this.options.paper.trigger('freetransform:create');

        // Register mouse events.
        $(document.body).on('mousemove touchmove', this.pointermove);
        $(document).on('mouseup touchend', this.pointerup);

        // Update halo when the graph is changed.
        this.listenTo(this.options.graph, 'all', this.update);

        // Remove halo when the model is removed.
        this.listenTo(this.options.cell, 'remove', this.remove);

        // Hide Halo when the user clicks anywhere in the paper or a new halo is created.
        this.listenTo(this.options.paper, 'blank:pointerdown freetransform:create', this.remove);
        this.listenTo(this.options.paper, 'scale', this.update);

        this.options.paper.$el.append(this.el);
    },

    render: function() {

        this.$el.html("<div class=\"resize\" data-position=\"top-left\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"top\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"top-right\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"right\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"bottom-right\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"bottom\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"bottom-left\" draggable=\"false\"/>\n<div class=\"resize\" data-position=\"left\" draggable=\"false\"/>\n<div class=\"rotate\" draggable=\"false\"/>\n\n");

        // We have to use `attr` as jQuery `data` doesn't update DOM
        this.$el.attr('data-type', this.options.cell.get('type'));

        this.update();
    },

    update: function() {

        var viewportCTM = this.options.paper.viewport.getCTM();

        var bbox = this.options.cell.getBBox();

        // Calculate the free transform size and position in viewport coordinate system.
        // TODO: take a viewport rotation in account.
        bbox.x *= viewportCTM.a;
        bbox.x += viewportCTM.e;
        bbox.y *= viewportCTM.d;
        bbox.y += viewportCTM.f;
        bbox.width *= viewportCTM.a;
        bbox.height *= viewportCTM.d;

        var angle = g.normalizeAngle(this.options.cell.get('angle') || 0);

        var transformVal =  'rotate(' + angle + 'deg)';

        this.$el.css({
            'width': bbox.width + 4,
            'height': bbox.height + 4,
            'left': bbox.x - 3,
            'top': bbox.y + 103,
            'transform': transformVal,
            '-webkit-transform': transformVal, // chrome + safari
            '-ms-transform': transformVal // IE 9
        });

        // Update the directions on the halo divs while the element being rotated. The directions are represented
        // by cardinal points (N,S,E,W). For example the div originally pointed to north needs to be changed
        // to point to south if the element was rotated by 180 degrees.
        var shift = Math.floor(angle * (this.options.directions.length / 360));

        if (shift != this._previousDirectionsShift) {

            // Create the current directions array based on the calculated shift.
            var directions = _.rest(this.options.directions, shift).concat(_.first(this.options.directions, shift));

            // Apply the array on the halo divs.
            this.$('.resize').removeClass('nw n ne e se s sw w').each(function(index, el) {
                $(el).addClass(directions[index]);
            });

            this._previousDirectionsShift = shift;
        }
    },

    startResizing: function(evt) {

        evt.stopPropagation();

        this.options.graph.trigger('batch:start');

        // Target's data attribute can contain one of 8 positions. Each position defines the way how to
        // resize an element. Whether to change the size on x-axis, on y-axis or on both.

        var direction = $(evt.target).data('position');

        var rx = 0, ry = 0;

        _.each(direction.split('-'), function(singleDirection) {

            rx = { 'left': -1, 'right': 1 }[singleDirection] || rx;
            ry = { 'top': -1, 'bottom': 1 }[singleDirection] || ry;
        });

        // The direction has to be one of the 4 directions the element's resize method would accept (TL,BR,BL,TR).
        direction = {
            'top': 'top-left',
            'bottom': 'bottom-right',
            'left' : 'bottom-left',
            'right': 'top-right'
        }[direction] || direction;

        // The selector holds a function name to pick a corner point on a rectangle.
        // See object `rect` in `src/geometry.js`.
        var selector = {
            'top-right' : 'bottomLeft',
            'top-left': 'corner',
            'bottom-left': 'topRight',
            'bottom-right': 'origin'
        }[direction];

        // Expose the initial setup, so `pointermove` method can access it.
        this._initial = {
            angle: g.normalizeAngle(this.options.cell.get('angle') || 0),
            resizeX: rx, // to resize, not to resize or flip coordinates on x-axis (1,0,-1)
            resizeY: ry, // to resize, not to resize or flip coordinates on y-axis (1,0,-1)
            selector: selector,
            direction: direction
        };

        this._action = 'resize';

        this.startOp(evt.target);
    },

    startRotating: function(evt) {

        evt.stopPropagation();

        this.options.graph.trigger('batch:start');

        var center = this.options.cell.getBBox().center();

        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });

        // Expose the initial setup, so `pointermove` method can acess it.
        this._initial = {
            // the centre of the element is the centre of the rotation
            centerRotation: center,
            // an angle of the element before the rotating starts
            modelAngle: g.normalizeAngle(this.options.cell.get('angle') || 0),
            // an angle between the line starting at mouse coordinates, ending at the center of rotation
            // and y-axis
            startAngle: g.point(clientCoords).theta(center)
        };

        this._action = 'rotate';

        this.startOp(evt.target);
    },

    pointermove: function(evt) {

        if (!this._action) return;

        evt = joint.util.normalizeEvent(evt);

        var clientCoords = this.options.paper.snapToGrid({ x: evt.clientX, y: evt.clientY });
        var gridSize = this.options.paper.options.gridSize;

        var model = this.options.cell, i = this._initial;

        switch (this._action) {

            case 'resize':

                var currentRect = model.getBBox();

                // The requested element's size has to be find on the unrotated element. Therefore we
                // are rotating a mouse coordinates back (coimageCoords) by an angle the element is rotated by and
                // with the center of rotation equals to the center of the unrotated element.
                var coimageCoords= g.point(clientCoords).rotate(currentRect.center(), i.angle);

                // The requested size is the difference between the fixed point and coimaged coordinates.
                var requestedSize = coimageCoords.difference(currentRect[i.selector]());

                // Calculate the new dimensions. `resizeX`/`resizeY` can hold a zero value if the resizing
                // on x-axis/y-axis is not allowed.
                var width = i.resizeX ? requestedSize.x * i.resizeX : currentRect.width;
                var height = i.resizeY ? requestedSize.y * i.resizeY : currentRect.height;

                // Constraint the dimensions.
                width = width < gridSize ? gridSize : g.snapToGrid(width, gridSize);
                height = height < gridSize ? gridSize : g.snapToGrid(height, gridSize);

                // Resize the element only if the dimensions are changed.
                if (currentRect.width != width || currentRect.height != height) {

                    model.resize(width, height, { direction: i.direction });
                }

                break;

            case 'rotate':

                // Calculate an angle between the line starting at mouse coordinates, ending at the centre
                // of rotation and y-axis and deduct the angle from the start of rotation.
                var theta = i.startAngle - g.point(clientCoords).theta(i.centerRotation);

                model.rotate(g.snapToGrid(i.modelAngle + theta, 15), true);

                break;
        }
    },

    pointerup: function(evt) {

        if (!this._action) return;

        this.stopOp();

        this.options.graph.trigger('batch:stop');

        delete this._action;
        delete this._initial;
    },

    remove: function(evt) {

        Backbone.View.prototype.remove.apply(this, arguments);

        $('body').off('mousemove touchmove', this.pointermove);
        $(document).off('mouseup touchend', this.pointerup);
    },

    startOp: function(el) {

        if (el) {
            // Add a class to the element we are operating with
            $(el).addClass('in-operation');
            this._elementOp = el;
        }

        this.$el.addClass('in-operation');
    },

    stopOp: function() {

        if (this._elementOp) {
            // Remove a class from the element we were operating with
            $(this._elementOp).removeClass('in-operation');
            delete this._elementOp;
        }

        this.$el.removeClass('in-operation');
    }
});