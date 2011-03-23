Ext.ns("Ext.layout");

Ext.layout.AccordionLayout = Ext.extend(Ext.layout.ContainerLayout, {
	/**
	  * @cfg {String} activeItem
	  * The active item to start active.
	  * Default: undefined
	  */
	/**
	  * @cfg {String} itemCls
	  * Default CSS class to be added to each item.
	  * Default: 'x-accordion-item'
	  */
	itemCls : "x-accordion-item",
	/**
	  * @cfg {String} targetCls
	  * Default CSS class to be added to target el.
	  * Default: 'x-layout-accordion'
	  */
	targetCls : "x-layout-accordion",
	/**
	  * @cfg {Boolean} allowCollapse
	  * Allow all items to be collapsed at the same time.
	  * Default: false
	  */
	allowCollapse : false,
	/**
	  * @cfg {Number} minHeight
	  * Minimum height of expanded component.
	  * Default: 150
	  */
	minHeight : 150,
	/**
	  * @cfg {Number} animDuration
	  * Number of milliseconds the animations will take.
	  * Default: 300
	  */
	animDuration : 300,
	/**
	  * @cfg {Number} easing
	  * Easing that animations will have.
	  * Default: 'ease-in'
	  */
	easing : "ease-in",
	/**
	  * @private
	  */
	type : "accordion",
	/**
	  * @private
	  */
	index : 0,

	/**
	  * @private
	  */
	initLayout : function() {
		var me = this;
		Ext.layout.AccordionLayout.superclass.initLayout.call(me);

		var owner = me.owner;
		owner.el.un("click");
		owner.el.on("click", me.handleOwnerClick, me, {delegate: "h3." + me.itemCls + "-header-wrap" });
	},

	onLayout : function() {
		var me          = this;
		me.expandHeight = me.getExpandHeight();
		Ext.layout.AccordionLayout.superclass.onLayout.call(me);
	},

	/**
	  * @private
	  */
	renderItem: function(item, position, target) {
		var me      = this;
		item.index  = me.index;
		item.hidden = true;
		Ext.layout.AccordionLayout.superclass.renderItem.call(me, item, position, target);

		me.wrapItem(item);

		if (me.activeItem === me.index) {
			me.expandHeight = me.getExpandHeight();
			me.expandItem(item);
		}

		me.index++;
	},

	/**
	  * @private
	  */
	moveItem: function(item, position, target) {
		target   = item.el.refs.itemWrap;
		position = 1;

		Ext.layout.AccordionLayout.superclass.moveItem.call(this, item, position, target);
	},

	/**
	  * @private
	  */
	wrapItem: function(item) {
		var me       = this,
			itemWrap = item.el.wrap({
				style : "-webkit-transition: height " + me.animDuration + "ms " + me.easing + "; overflow: hidden;"
			}),
			parent = itemWrap.wrap({
				cls : "section"
			}),
			header = parent.createChild({
				tag  : "h3",
				cls  : me.itemCls + "-header-wrap",
				html : item.title
			}, itemWrap),
			arrow = header.createChild({
				tag : "div",
				cls : me.itemCls + "-arrow"
			});

		item.el.refs = {
			itemWrap   : itemWrap,
			parentWrap : parent,
			header     : header,
			arrow      : arrow
		};
	},

	expandItem: function(item) {
		var me = this;
		item   = me.parseActiveItem(item);

		if (!item.fireEvent("beforeactivate", me.owner, item, me.activeItem)) { return false; }
		if (!item.fireEvent("beforeexpand", me.owner, item, me.activeItem)) { return false; }

		var el    = item.el,
			arrow = el.refs.arrow;

		me.activeItem = item;

		el.refs.itemWrap.setHeight(me.expandHeight);

		me.rotateArrow(arrow, 90);

		new Ext.util.DelayedTask(function() {
			item.setHeight(me.expandHeight);
			item.setVisible(true);
			item.fireEvent("activate", me.owner, item, me.activeItem);
			item.fireEvent("expand", me.owner, item, me.activeItem);
		}, me).delay(me.animDuration);
	},

	collapseItem: function(item) {
		var me = this;
		item   = me.parseActiveItem(item);

		if (!item.fireEvent("beforedeactivate", me.owner, item, me.activeItem)) { return false; }
		if (!item.fireEvent("beforecollapse", me.owner, item, me.activeItem)) { return false; }

		var el    = item.el,
			arrow = el.refs.arrow;

		me.activeItem = undefined;

		el.refs.itemWrap.setHeight(0);

		me.rotateArrow(arrow, 0);

		new Ext.util.DelayedTask(function() {
			item.setHeight(0);
			item.setVisible(true);
			item.fireEvent("deactivate", me.owner, item, me.activeItem);
			item.fireEvent("collapse", me.owner, item, me.activeItem);
		}, me).delay(me.animDuration);
	},

	/**
	 * Return the active (visible) component in the layout.
	 * @returns {Ext.Component}
	 */
	getActiveItem: function() {
		var me = this;

		if (!me.activeItem && me.owner) {
			me.activeItem = me.parseActiveItem(me.owner.activeItem);
		}
		if (me.activeItem && me.owner.items.items.indexOf(me.activeItem) != -1) {
			return me.activeItem;
		}
		return null;
	},

	/**
	  * @private
	  */
	parseActiveItem: function(item) {
		var me = this;

		if (item && item.isComponent) {
			return item;
		} else if (typeof item == 'number' || item == undefined) {
			return me.getLayoutItems()[item || 0];
		} else {
			return me.owner.getComponent(item);
		}
	},

	/**
	  * @private
	  */
	handleOwnerClick: function(e, t) {
		e.stopEvent();
		var me     = this,
			el     = Ext.get(t),
			itemEl = el.next().first(),
			item   = me.parseActiveItem(itemEl.id);

		if (item === me.activeItem && me.allowCollapse) {
			me.collapseItem(item);
		} else {
			me.collapseItem(me.activeItem);
			me.expandItem(item);
		}
	},

	/**
	  * @private
	  */
	getExpandHeight: function() {
		var me           = this,
			items        = me.getLayoutItems(),
			numItems     = items.length,
			header       = items[0].el.refs.header,
			headerHeight = header.getHeight() * numItems,
			expandHeight = me.getTarget().getHeight() - headerHeight,
			minHeight    = me.minHeight;

		if (expandHeight < minHeight) {
			expandHeight = minHeight;
		}

		return expandHeight;
	},

	/**
	  * @private
	  */
	rotateArrow: function(el, deg) {
		var me = this;

		el.setStyle({
			"-webkit-transform"                  : "rotate(" + deg + "deg)",
			"-webkit-transition-property"        : "-webkit-transform",
			"-webkit-transition-duration"        : me.animDuration + "ms",
			"-webkit-transition-timing-function" : me.easing
		});
	}
});

Ext.regLayout("accordion", Ext.layout.AccordionLayout);