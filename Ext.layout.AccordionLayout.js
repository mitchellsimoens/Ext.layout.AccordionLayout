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

		this.getExpandedHeight(items);

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
		item.wrap = wrap;
	},

	moveItem: function(item, position, target) {
		target = item.wrap;
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

		return wrap;
	},

	getExpandedHeight: function(items) {
		var height = 0, parent;
		for (var i = 0; i < items.length; i++) {
			parent = items[i].el.parent();
			height += parent.child("." + this.itemCls + "-header-wrap").getHeight();
		}

		this.expandedHeight = this.getTarget().getHeight() - height - 6;

		return this.expandedHeight;
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

		el.setStyle("height", this.expandedHeight + "px");
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