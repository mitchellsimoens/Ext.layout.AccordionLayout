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
	  * @private
	  */
	type: "accordion",

	activeEl: undefined,

	/**
	  * @private
	  */
	onLayout: function() {
		Ext.layout.AccordionLayout.superclass.onLayout.call(this);

		var items = this.getLayoutItems();

		this.prepareItems(items);
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
		item.el.headerEl = wrap[1]
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
			html: "<a>" + item.title + "</a>"
		}, item.el);

		title.on("click", this.expandItem, this);

		return [wrap, title];
	},

	/**
	  * @private
	  */
	startExpand: function(items) {
		var el = this.activeEl || items[this.activeItem].el;

		this.expandItem(el);
	},

	expandItem: function(el, node) {
		el = this.pickEl(el, node);

		this.activeEl = el;

		var target = this.getTarget();

		var sections = target.query(".section");
		for (var i = 0; i < sections.length; i++) {
			var section = Ext.get(sections[i]);
			var item = section.child("." + this.itemCls);
			this.collapseItem(item);
		}

		var headerHeight = el.headerEl.getHeight();
		headerHeight *= i;

		var expandHeight = this.getTarget().getHeight() - headerHeight;

		el.setStyle("height", expandHeight + "px");
	},

	/**
	  * @private
	  */
	collapseItem: function(el) {
		if (el === null) { return ; }
		el.setStyle("height", "0px");
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