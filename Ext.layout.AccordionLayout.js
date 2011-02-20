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

	/**
	  * @private
	  */
	onLayout: function() {
		Ext.layout.AccordionLayout.superclass.onLayout.call(this);

		this.prepareItems();
	},

	/**
	  * @private
	  */
	prepareItems: function() {
		var items = this.getLayoutItems(),
			ln = items.length,
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

		var wrap = item.el.wrap({
			cls: "section"
		});

		var title = wrap.createChild({
			tag: "h3",
			html: "<a>" + item.title + "</a>"
		}, item.el);

		title.on("click", this.expandItem, this);
	},

	/**
	  * @private
	  */
	startExpand: function(items) {
		var item = items[this.activeItem];

		var height = 0, parent;
		for (var i = 0; i < items.length; i++) {
			parent = items[i].el.parent();
			height += parent.getHeight();
		}

		this.expandedHeight = this.getTarget().getHeight() - height;

		this.expandItem(item.el);
	},

	expandItem: function(el, node) {
		el = this.pickEl(el, node);

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
		el = this.pickEl(el);

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