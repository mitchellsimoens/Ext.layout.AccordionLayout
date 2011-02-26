Ext.ns("Ext.layout");

Ext.layout.AccordionLayout = Ext.extend(Ext.layout.ContainerLayout, {
	/**
	  * @cfg {String} activeItem
	  * The active item to start active.
	  * Default: 0
	  */
	activeItem: 0,
	/**
	  * @cfg {String} itemCls
	  * Default CSS class to be added to each item.
	  * Default: 'x-accordion-item'
	  */
	itemCls: "x-accordion-item",
	/**
	  * @cfg {String} targetCls
	  * Default CSS class to be added to target el.
	  * Default: 'x-layout-accordion'
	  */
	targetCls: "x-layout-accordion",
	/**
	  * @cfg {Boolean} allowCollapse
	  * Allow all items to be collapsed at the same time.
	  * Default: false
	  */
	allowCollapse: false,
	/**
	  * @cfg {Number} minHeight
	  * Minimum height of expanded component.
	  * Default: 150
	  */
	minHeight: 150,
	/**
	  * @cfg {Number} animDuration
	  * Number of milliseconds the animations will take.
	  * Default: 300
	  */
	animDuration: 300,
	/**
	  * @cfg {Number} easing
	  * Easing that animations will have.
	  * Default: 'ease-in'
	  */
	easing: "ease-in",
	/**
	  * @private
	  */
	type: "accordion",
	/**
	  * @private
	  */
	index: 0,

	/**
	  * @private
	  */
	initLayout : function() {
		Ext.layout.AccordionLayout.superclass.initLayout.call(this);

		var owner = this.owner;
		owner.el.un("click");
		owner.el.on("click", this.handleOwnerClick, this, {delegate: "h3." + this.itemCls + "-header-wrap" });
	},

	onLayout : function() {
		this.expandHeight = this.getExpandHeight();
		Ext.layout.AccordionLayout.superclass.onLayout.call(this);
	},

	/**
	  * @private
	  */
	renderItem: function(item, position, target) {
		item.index = this.index;
		item.hidden = true;
		Ext.layout.AccordionLayout.superclass.renderItem.call(this, item, position, target);

		this.wrapItem(item);

		if (this.activeItem === this.index) {
			this.expandHeight = this.getExpandHeight();
			this.expandItem(item);
		}

		this.index++;
	},

	/**
	  * @private
	  */
	moveItem: function(item, position, target) {
		target = item.el.refs.itemWrap;
		position = 1;
		Ext.layout.AccordionLayout.superclass.moveItem.call(this, item, position, target);
	},

	/**
	  * @private
	  */
	wrapItem: function(item) {
		var itemWrap = item.el.wrap({
			style: "-webkit-transition: height " + this.animDuration + "ms " + this.easing + "; overflow: hidden;"
		});

		var parent = itemWrap.wrap({
			cls: "section"
		});

		var header = parent.createChild({
			tag: "h3",
			cls: this.itemCls + "-header-wrap",
			style: "width: 100%; color: #ffffff; background-image: -webkit-gradient(linear,0% 0,0% 100%,color-stop(0%,#96A9C0),color-stop(2%,#5A7596),color-stop(100%,#394B5F));",
			html: item.title
		}, itemWrap);

		var arrow = header.createChild({
			tag: "div",
			cls: this.itemCls + "-arrow"
		});

		item.el.refs = {
			itemWrap: itemWrap,
			parentWrap: parent,
			header: header,
			arrow: arrow
		};
	},

	expandItem: function(item) {
		item = this.parseActiveItem(item);

		if (!item.fireEvent("beforeactivate", this.owner, item, this.activeItem)) { return false; }
		if (!item.fireEvent("beforeexpand", this.owner, item, this.activeItem)) { return false; }

		var el = item.el,
			arrow = el.refs.arrow;

		this.activeItem = item;

		el.refs.itemWrap.setHeight(this.expandHeight);

		this.rotateArrow(arrow, 90);

		new Ext.util.DelayedTask(function() {
			item.setHeight(this.expandHeight);
			item.setVisible(true);
			item.fireEvent("activate", this.owner, item, this.activeItem);
			item.fireEvent("expand", this.owner, item, this.activeItem);
		}, this).delay(this.animDuration);
	},

	collapseItem: function(item) {
		item = this.parseActiveItem(item);

		if (!item.fireEvent("beforedeactivate", this.owner, item, this.activeItem)) { return false; }
		if (!item.fireEvent("beforecollapse", this.owner, item, this.activeItem)) { return false; }

		var el = item.el,
			arrow = el.refs.arrow;

		this.activeItem = undefined;

		el.refs.itemWrap.setHeight(0);

		this.rotateArrow(arrow, 0);

		new Ext.util.DelayedTask(function() {
			item.setHeight(0);
			item.setVisible(true);
			item.fireEvent("deactivate", this.owner, item, this.activeItem);
			item.fireEvent("collapse", this.owner, item, this.activeItem);
		}, this).delay(this.animDuration);
	},

	/**
	 * Return the active (visible) component in the layout.
	 * @returns {Ext.Component}
	 */
	getActiveItem: function() {
		if (!this.activeItem && this.owner) {
			this.activeItem = this.parseActiveItem(this.owner.activeItem);
		}
		if (this.activeItem && this.owner.items.items.indexOf(this.activeItem) != -1) {
			return this.activeItem;
		}
		return null;
	},

	/**
	  * @private
	  */
	parseActiveItem: function(item) {
		if (item && item.isComponent) {
			return item;
		} else if (typeof item == 'number' || item == undefined) {
			return this.getLayoutItems()[item || 0];
		} else {
			return this.owner.getComponent(item);
		}
	},

	/**
	  * @private
	  */
	handleOwnerClick: function(e, t) {
		e.stopEvent();
		var el = Ext.get(t),
			itemEl = el.next().first(),
			item = this.parseActiveItem(itemEl.id);

		if (item === this.activeItem && this.allowCollapse) {
			this.collapseItem(item);
		} else {
			this.collapseItem(this.activeItem);
			this.expandItem(item);
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
		el.setStyle({
			"-webkit-transform": "rotate(" + deg + "deg)",
			"-webkit-transition-property": "-webkit-transform",
			"-webkit-transition-duration": this.animDuration + "ms",
			"-webkit-transition-timing-function": this.easing
		});
	},
});

Ext.regLayout("accordion", Ext.layout.AccordionLayout);