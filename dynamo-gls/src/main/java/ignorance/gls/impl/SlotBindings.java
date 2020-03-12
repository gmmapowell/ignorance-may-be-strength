package ignorance.gls.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Consumer;

import ignorance.exceptions.NotImplementedException;
import ignorance.gls.intf.Relation;
import ignorance.gls.intf.UnitOfWork;
import ignorance.tdastore.intf.TDAStorage;

public class SlotBindings {
	private final TDAStorage storage;
	private final UnitOfWork uow;
	private final SlotBindings parent;
	private Relation relation;
	private final Map<String, Object> slots = new TreeMap<>();
	private final Map<Relation, SlotBindings> children = new HashMap<>();

	public SlotBindings(TDAStorage storage, UnitOfWork uow) {
		this.storage = storage;
		this.uow = uow;
		this.parent = null;
		this.relation = null;
		slots.put(TDAStorage.class.getName(), storage);
		slots.put(UnitOfWork.class.getName(), uow);
	}

	public SlotBindings(SlotBindings parent) {
		this.storage = parent.storage;
		this.uow = parent.uow;
		this.parent = parent;
	}

	public void relation(GLSRelation ret) {
		this.relation = ret;
		parent.children.put(relation, this);
		slots.put(Relation.class.getName(), relation);
	}

	public synchronized <T> void bind(String slot, T object) {
		slots.put(slot, object);
	}

	public void walk(Object value) {
		walkInterfaces(value.getClass(), intf -> bind(intf.getName(), value));
	}

	public synchronized boolean has(String slot) {
		return slots.containsKey(slot) || parent != null && parent.has(slot);
	}
	
	public synchronized Object bound(String slot) {
		if (slots.containsKey(slot))
			return slots.get(slot);
		if (parent != null)
			return parent.bound(slot);
		throw new RuntimeException("Nothing bound in " + slot);
	}

	// Should this be a general utility method?
	private void walkInterfaces(Class<? extends Object> cls, Consumer<Class<?>> consumer) {
		if (cls == null || cls == Object.class)
			return;
		consumer.accept(cls);
		for (Class<?> intf : cls.getInterfaces()) {
			consumer.accept(intf);
			walkInterfaces(intf, consumer);
		}
		walkInterfaces(cls.getSuperclass(), consumer);
	}

	public SlotBindings cloneMe(SlotBindings newParent) {
		SlotBindings ret;
		if (parent == null)
			ret = new SlotBindings(storage, uow);
		else
			ret = new SlotBindings(newParent);
		ret.slots.putAll(slots);
		for (SlotBindings b : new ArrayList<>(children.values()))
			b.cloneMe(ret);
		return ret;
	}

	public SlotBindings child(GLSRelation r) {
		if (!children.containsKey(r))
			throw new NotImplementedException();
		return children.get(r);
	}
	
	@Override
	public String toString() {
		return slots.toString();
	}
}
