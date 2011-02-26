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
	  * @private
	  */
	type: "accordion",

	activeEl: undefined,

	beforeLayout: function() {
		this.layoutBusy = true;
		this.activeItem = this.getActiveItem();
		Ext.layout.AccordionLayout.superclass.beforeLayout.apply(this, arguments);
	},

	/**
	  * @private
	  */
	afterLayout: function() {
		var items = this.getLayoutItems();

		this.prepareItems(items);
		this.layoutBusy = false;
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
	prepareItems: function(items) {
		var ln = items.length,
			item, i;

		for (i = 0; i < ln; i++) {
			item = items[i];
			item.doComponentLayout();
			if (item.el !== this.activeEl) {
				this.collapseItem(item.el);
			}
		}

		this.startExpand(items);
	},

	/**
	  * @private
	  */
	renderItem: function(item, position, target) {
		Ext.layout.AccordionLayout.superclass.renderItem.call(this, item, position, target);

		var wrap = this.wrapItem(item);
		item.wrapEl = wrap[0];
		item.el.headerEl = wrap[1];
	},

	moveItem: function(item, position, target) {
		target = item.wrapEl;
		position = 1;
		Ext.layout.AccordionLayout.superclass.moveItem.call(this, item, position, target);
	},

	wrapItem: function(item) {
		var wrap = item.el.wrap({
			cls: "section"
		});

		var title = wrap.createChild({
			tag: "h3",
			cls: this.itemCls + "-header-wrap",
			html: item.title + "<div class='" + this.itemCls + "-arrow'></div>"
		}, item.el);

		title.on("click", this.expandItem, this);

		return [wrap, title];
	},

	/**
	  * @private
	  */
	startExpand: function(items) {
		var el = this.activeEl || this.activeItem.el;

		this.expandItem(el);
	},

	expandItem: function(el, node) {
		el = this.pickEl(el, node);
		var activeItem = this.activeItem,
			owner      = this.owner;

		if (!activeItem.fireEvent("beforeactivate", activeItem)) { return false; }

		if (el === this.activeEl && !this.layoutBusy && this.allowCollapse) {
			this.collapseItem(el);
			this.activeEl = null;
			return ;
		}

		var arrow = Ext.get(el.headerEl.query("." + this.itemCls + "-arrow")[0]);

		this.rotateArrow(arrow, 90);

		var target = this.getTarget(),
			minHeight = this.minHeight;

		var sections = target.query(".section");
		if (typeof this.activeEl === "object") {
			this.collapseItem(this.activeEl);
		}

		var headerHeight = el.headerEl.getHeight();
		headerHeight *= sections.length;

		var expandHeight = this.getTarget().getHeight() - headerHeight;

		if (expandHeight < minHeight) {
			expandHeight = minHeight;
		}

		el.setStyle("height", expandHeight + "px");

		activeItem.fireEvent("activate", activeItem);

		this.activeEl = el;
	},

	/**
	  * @private
	  */
	collapseItem: function(el) {
		var activeItem = this.activeItem;
		if (el === null || !activeItem.fireEvent("beforedeactivate", activeItem)) { return ; }
		var arrow = Ext.get(el.headerEl.query("." + this.itemCls + "-arrow")[0]);
		this.rotateArrow(arrow, 0);

		el.setStyle("height", "0px");
		activeItem.fireEvent("deactivate", activeItem);
	},

	rotateArrow: function(el, deg) {
		el.setStyle({
			"-webkit-transform": "rotate(" + deg + "deg)",
			"-webkit-transition-property": "-webkit-transform",
			"-webkit-transition-duration": "0.3s",
			"-webkit-transition-timing-function": "ease-in-out"
		});
	},

	/**
	  * @private
	  */
	pickEl: function(el, node) {
		if (typeof el.dom !== "object") {
			el = Ext.get(node);
		}
		if (!el.hasCls(this.itemCls)) {
			if (!el.hasCls(this.targetCls)) {
				el = el.up(".section");
			}
			el = el.child("." + this.itemCls);
		}

		return el;
	}
});

Ext.regLayout("accordion", Ext.layout.AccordionLayout);