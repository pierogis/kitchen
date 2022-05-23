(function (l, r) {
	if (!l || l.getElementById('livereloadscript')) return;
	r = l.createElement('script');
	r.async = 1;
	r.src =
		'//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1';
	r.id = 'livereloadscript';
	l.getElementsByTagName('head')[0].appendChild(r);
})(self.document);
function _mergeNamespaces(n, m) {
	m.forEach(function (e) {
		e &&
			typeof e !== 'string' &&
			!Array.isArray(e) &&
			Object.keys(e).forEach(function (k) {
				if (k !== 'default' && !(k in n)) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(
						n,
						k,
						d.get
							? d
							: {
									enumerable: true,
									get: function () {
										return e[k];
									}
							  }
					);
				}
			});
	});
	return Object.freeze(n);
}

function noop() {}
function assign(tar, src) {
	// @ts-ignore
	for (const k in src) tar[k] = src[k];
	return tar;
}
function run(fn) {
	return fn();
}
function blank_object() {
	return Object.create(null);
}
function run_all(fns) {
	fns.forEach(run);
}
function is_function(thing) {
	return typeof thing === 'function';
}
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
	if (store == null) {
		return noop;
	}
	const unsub = store.subscribe(...callbacks);
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
	let value;
	subscribe(store, (_) => (value = _))();
	return value;
}
function component_subscribe(component, store, callback) {
	component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
		return definition[0](slot_ctx);
	}
}
function get_slot_context(definition, ctx, $$scope, fn) {
	return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
	if (definition[2] && fn) {
		const lets = definition[2](fn(dirty));
		if ($$scope.dirty === undefined) {
			return lets;
		}
		if (typeof lets === 'object') {
			const merged = [];
			const len = Math.max($$scope.dirty.length, lets.length);
			for (let i = 0; i < len; i += 1) {
				merged[i] = $$scope.dirty[i] | lets[i];
			}
			return merged;
		}
		return $$scope.dirty | lets;
	}
	return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
	if (slot_changes) {
		const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
		slot.p(slot_context, slot_changes);
	}
}
function get_all_dirty_from_scope($$scope) {
	if ($$scope.ctx.length > 32) {
		const dirty = [];
		const length = $$scope.ctx.length / 32;
		for (let i = 0; i < length; i++) {
			dirty[i] = -1;
		}
		return dirty;
	}
	return -1;
}
function action_destroyer(action_result) {
	return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
	tasks.forEach((task) => {
		if (!task.c(now)) {
			tasks.delete(task);
			task.f();
		}
	});
	if (tasks.size !== 0) raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
	let task;
	if (tasks.size === 0) raf(run_tasks);
	return {
		promise: new Promise((fulfill) => {
			tasks.add((task = { c: callback, f: fulfill }));
		}),
		abort() {
			tasks.delete(task);
		}
	};
}
function append(target, node) {
	target.appendChild(node);
}
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}
function detach(node) {
	node.parentNode.removeChild(node);
}
function element(name) {
	return document.createElement(name);
}
function svg_element(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
	return document.createTextNode(data);
}
function space() {
	return text(' ');
}
function empty() {
	return text('');
}
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
	return function (event) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}
function children(element) {
	return Array.from(element.childNodes);
}
function set_style(node, key, value, important) {
	node.style.setProperty(key, value, important ? 'important' : '');
}
function toggle_class(element, name, toggle) {
	element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, bubbles = false) {
	const e = document.createEvent('CustomEvent');
	e.initCustomEvent(type, bubbles, false, detail);
	return e;
}

let current_component;
function set_current_component(component) {
	current_component = component;
}
function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}
function createEventDispatcher() {
	const component = get_current_component();
	return (type, detail) => {
		const callbacks = component.$$.callbacks[type];
		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(type, detail);
			callbacks.slice().forEach((fn) => {
				fn.call(component, event);
			});
		}
	};
}
function setContext(key, context) {
	get_current_component().$$.context.set(key, context);
}
function getContext(key) {
	return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}
function tick() {
	schedule_update();
	return resolved_promise;
}
function add_render_callback(fn) {
	render_callbacks.push(fn);
}
function add_flush_callback(fn) {
	flush_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
	if (flushing) return;
	flushing = true;
	do {
		// first, call beforeUpdate functions
		// and update components
		for (let i = 0; i < dirty_components.length; i += 1) {
			const component = dirty_components[i];
			set_current_component(component);
			update(component.$$);
		}
		set_current_component(null);
		dirty_components.length = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	flushing = false;
	seen_callbacks.clear();
}
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}
const outroing = new Set();
let outros;
function group_outros() {
	outros = {
		r: 0,
		c: [],
		p: outros // parent group
	};
}
function check_outros() {
	if (!outros.r) {
		run_all(outros.c);
	}
	outros = outros.p;
}
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}
function transition_out(block, local, detach, callback) {
	if (block && block.o) {
		if (outroing.has(block)) return;
		outroing.add(block);
		outros.c.push(() => {
			outroing.delete(block);
			if (callback) {
				if (detach) block.d(1);
				callback();
			}
		});
		block.o(local);
	}
}

const globals =
	typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : global;
function outro_and_destroy_block(block, lookup) {
	transition_out(block, 1, 1, () => {
		lookup.delete(block.key);
	});
}
function update_keyed_each(
	old_blocks,
	dirty,
	get_key,
	dynamic,
	ctx,
	list,
	lookup,
	node,
	destroy,
	create_each_block,
	next,
	get_context
) {
	let o = old_blocks.length;
	let n = list.length;
	let i = o;
	const old_indexes = {};
	while (i--) old_indexes[old_blocks[i].key] = i;
	const new_blocks = [];
	const new_lookup = new Map();
	const deltas = new Map();
	i = n;
	while (i--) {
		const child_ctx = get_context(ctx, list, i);
		const key = get_key(child_ctx);
		let block = lookup.get(key);
		if (!block) {
			block = create_each_block(key, child_ctx);
			block.c();
		} else if (dynamic) {
			block.p(child_ctx, dirty);
		}
		new_lookup.set(key, (new_blocks[i] = block));
		if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
	}
	const will_move = new Set();
	const did_move = new Set();
	function insert(block) {
		transition_in(block, 1);
		block.m(node, next);
		lookup.set(block.key, block);
		next = block.first;
		n--;
	}
	while (o && n) {
		const new_block = new_blocks[n - 1];
		const old_block = old_blocks[o - 1];
		const new_key = new_block.key;
		const old_key = old_block.key;
		if (new_block === old_block) {
			// do nothing
			next = new_block.first;
			o--;
			n--;
		} else if (!new_lookup.has(old_key)) {
			// remove old block
			destroy(old_block, lookup);
			o--;
		} else if (!lookup.has(new_key) || will_move.has(new_key)) {
			insert(new_block);
		} else if (did_move.has(old_key)) {
			o--;
		} else if (deltas.get(new_key) > deltas.get(old_key)) {
			did_move.add(new_key);
			insert(new_block);
		} else {
			will_move.add(old_key);
			o--;
		}
	}
	while (o--) {
		const old_block = old_blocks[o];
		if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
	}
	while (n) insert(new_blocks[n - 1]);
	return new_blocks;
}

function get_spread_update(levels, updates) {
	const update = {};
	const to_null_out = {};
	const accounted_for = { $$scope: 1 };
	let i = levels.length;
	while (i--) {
		const o = levels[i];
		const n = updates[i];
		if (n) {
			for (const key in o) {
				if (!(key in n)) to_null_out[key] = 1;
			}
			for (const key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}
			levels[i] = n;
		} else {
			for (const key in o) {
				accounted_for[key] = 1;
			}
		}
	}
	for (const key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}
	return update;
}
function get_spread_object(spread_props) {
	return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

function bind(component, name, callback) {
	const index = component.$$.props[name];
	if (index !== undefined) {
		component.$$.bound[index] = callback;
		callback(component.$$.ctx[index]);
	}
}
function create_component(block) {
	block && block.c();
}
function mount_component(component, target, anchor, customElement) {
	const { fragment, on_mount, on_destroy, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	if (!customElement) {
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = on_mount.map(run).filter(is_function);
			if (on_destroy) {
				on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
	}
	after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	const $$ = (component.$$ = {
		fragment: null,
		ctx: null,
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			const nodes = children(options.target);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor, options.customElement);
		flush();
	}
	set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}
	$on(type, callback) {
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}
	$set($$props) {
		if (this.$$set && !is_empty($$props)) {
			this.$$.skip_bound = true;
			this.$$set($$props);
			this.$$.skip_bound = false;
		}
	}
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
	return {
		subscribe: writable(value, start).subscribe
	};
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
	let stop;
	const subscribers = new Set();
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	}
	function update(fn) {
		set(fn(value));
	}
	function subscribe(run, invalidate = noop) {
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set) || noop;
		}
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0) {
				stop();
				stop = null;
			}
		};
	}
	return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
	const single = !Array.isArray(stores);
	const stores_array = single ? [stores] : stores;
	const auto = fn.length < 2;
	return readable(initial_value, (set) => {
		let inited = false;
		const values = [];
		let pending = 0;
		let cleanup = noop;
		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set);
			if (auto) {
				set(result);
			} else {
				cleanup = is_function(result) ? result : noop;
			}
		};
		const unsubscribers = stores_array.map((store, i) =>
			subscribe(
				store,
				(value) => {
					values[i] = value;
					pending &= ~(1 << i);
					if (inited) {
						sync();
					}
				},
				() => {
					pending |= 1 << i;
				}
			)
		);
		inited = true;
		sync();
		return function stop() {
			run_all(unsubscribers);
			cleanup();
		};
	});
}

const initialState = {
	width: window.innerWidth,
	height: window.innerHeight
};
const viewportStore = writable(initialState);

class IngredientControl {
	subscribe(pane, store, params) {
		store.subscribe((parameters) => {
			Object.entries(parameters).forEach(([name, value]) => {
				params[name] = value;
			});
			pane.refresh();
		});
	}
}
const ingredientsStore = writable({});

// context key for stashing all nodes updates callbacks
// the different types of data linking
var ParameterType;
(function (ParameterType) {
	ParameterType[(ParameterType['number'] = 0)] = 'number';
	ParameterType[(ParameterType['color'] = 1)] = 'color';
})(ParameterType || (ParameterType = {}));
const connectionsStore = writable({});
function addConnection(connection) {
	connectionsStore.update((connections) => {
		connections[connection.connectionId] = connection;
		return connections;
	});
}
function updateConnection(connection) {
	connectionsStore.update((connections) => {
		connections[connection.connectionId] = connection;
		return connections;
	});
}
function removeConnection(connectionId) {
	connectionsStore.update((connections) => {
		delete connections[connectionId];
		return connections;
	});
}

class PlateControl extends IngredientControl {
	constructor() {
		super(...arguments);
		this.type = 'plate';
	}
	default(id, coords) {
		let defaultParameters = get_store_value(viewportStore);
		let defaultRacks = { in: {}, out: {} };
		for (let propertyName in defaultParameters) {
			defaultRacks.in[propertyName] = {
				parameterType: ParameterType.number
			};
			defaultRacks.out[propertyName] = {
				parameterType: ParameterType.number
			};
		}
		return {
			nodeId: id,
			type: this.type,
			coords: writable(coords),
			parameters: writable(defaultParameters),
			racks: defaultRacks,
			dockedStatus: writable({ docked: false })
		};
	}
	attach(pane, params, store) {
		let widthInput = pane
			.addInput(params, 'width', {
				step: 1
			})
			.on('change', (ev) => {
				store.update((old) => {
					old.width = ev.value;
					return old;
				});
			});
		let heightInput = pane
			.addInput(params, 'height', {
				step: 1
			})
			.on('change', (ev) => {
				store.update((old) => {
					old.height = ev.value;
					return old;
				});
			});
		return {
			width: widthInput,
			height: heightInput
		};
	}
}

var commonjsGlobal =
	typeof globalThis !== 'undefined'
		? globalThis
		: typeof window !== 'undefined'
		? window
		: typeof global !== 'undefined'
		? global
		: typeof self !== 'undefined'
		? self
		: {};

function createCommonjsModule(fn, basedir, module) {
	return (
		(module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, base === undefined || base === null ? module.path : base);
			}
		}),
		fn(module, module.exports),
		module.exports
	);
}

function commonjsRequire() {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var tweakpaneImagePlugin = createCommonjsModule(function (module, exports) {
	(function (global, factory) {
		factory(exports);
	})(commonjsGlobal, function (exports) {
		function forceCast(v) {
			return v;
		}

		const PREFIX = 'tp';
		function ClassName(viewName) {
			const fn = (opt_elementName, opt_modifier) => {
				return [
					PREFIX,
					'-',
					viewName,
					'v',
					opt_elementName ? `_${opt_elementName}` : '',
					opt_modifier ? `-${opt_modifier}` : ''
				].join('');
			};
			return fn;
		}

		function parseObject(value, keyToParserMap) {
			const keys = Object.keys(keyToParserMap);
			const result = keys.reduce((tmp, key) => {
				if (tmp === undefined) {
					return undefined;
				}
				const parser = keyToParserMap[key];
				const result = parser(value[key]);
				return result.succeeded
					? Object.assign(Object.assign({}, tmp), { [key]: result.value })
					: undefined;
			}, {});
			return forceCast(result);
		}
		function parseArray(value, parseItem) {
			return value.reduce((tmp, item) => {
				if (tmp === undefined) {
					return undefined;
				}
				const result = parseItem(item);
				if (!result.succeeded || result.value === undefined) {
					return undefined;
				}
				return [...tmp, result.value];
			}, []);
		}
		function isObject(value) {
			if (value === null) {
				return false;
			}
			return typeof value === 'object';
		}
		function createParamsParserBuilder(parse) {
			return (optional) => (v) => {
				if (!optional && v === undefined) {
					return {
						succeeded: false,
						value: undefined
					};
				}
				if (optional && v === undefined) {
					return {
						succeeded: true,
						value: undefined
					};
				}
				const result = parse(v);
				return result !== undefined
					? {
							succeeded: true,
							value: result
					  }
					: {
							succeeded: false,
							value: undefined
					  };
			};
		}
		function createParamsParserBuilders(optional) {
			return {
				custom: (parse) => createParamsParserBuilder(parse)(optional),
				boolean: createParamsParserBuilder((v) => (typeof v === 'boolean' ? v : undefined))(
					optional
				),
				number: createParamsParserBuilder((v) => (typeof v === 'number' ? v : undefined))(optional),
				string: createParamsParserBuilder((v) => (typeof v === 'string' ? v : undefined))(optional),
				function: createParamsParserBuilder((v) => (typeof v === 'function' ? v : undefined))(
					optional
				),
				constant: (value) =>
					createParamsParserBuilder((v) => (v === value ? value : undefined))(optional),
				raw: createParamsParserBuilder((v) => v)(optional),
				object: (keyToParserMap) =>
					createParamsParserBuilder((v) => {
						if (!isObject(v)) {
							return undefined;
						}
						return parseObject(v, keyToParserMap);
					})(optional),
				array: (itemParser) =>
					createParamsParserBuilder((v) => {
						if (!Array.isArray(v)) {
							return undefined;
						}
						return parseArray(v, itemParser);
					})(optional)
			};
		}
		const ParamsParsers = {
			optional: createParamsParserBuilders(true),
			required: createParamsParserBuilders(false)
		};
		function parseParams(value, keyToParserMap) {
			const result = ParamsParsers.required.object(keyToParserMap)(value);
			return result.succeeded ? result.value : undefined;
		}

		const DEFAULT_EXTENSIONS = ['.jpg', '.png', '.gif'];
		const className = ClassName('img');
		class PluginView {
			constructor(doc, config) {
				var _a;
				this.element = doc.createElement('div');
				this.element.classList.add(className());
				config.viewProps.bindClassModifiers(this.element);
				this.value_ = config.value;
				this.value_.emitter.on('change', this.onValueChange_.bind(this));
				this.input = doc.createElement('input');
				this.input.classList.add(className('input'));
				this.input.setAttribute('type', 'file');
				this.input.setAttribute(
					'accept',
					((_a = config.extensions) !== null && _a !== void 0 ? _a : DEFAULT_EXTENSIONS).join(',')
				);
				this.element.appendChild(this.input);
				this.image_ = doc.createElement('img');
				this.image_.classList.add(className('image'));
				this.element.appendChild(this.image_);
				this.refresh_();
			}
			refresh_() {
				const rawValue = this.value_.rawValue;
				this.image_.setAttribute('src', rawValue.src);
			}
			onValueChange_() {
				this.refresh_();
			}
		}

		class PluginController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new PluginView(doc, {
					value: this.value,
					viewProps: this.viewProps,
					extensions: config.extensions
				});
				this.onFile_ = this.onFile_.bind(this);
				this.view.input.addEventListener('change', this.onFile_);
				this.viewProps.handleDispose(() => {
					this.view.input.removeEventListener('change', this.onFile_);
				});
			}
			onFile_(event) {
				const files = (event === null || event === void 0 ? void 0 : event.target).files;
				if (!files || !files.length) return;
				const file = files[0];
				const image = document.createElement('img');
				image.src = URL.createObjectURL(file);
				const onLoad = () => {
					image.removeEventListener('load', onLoad);
					this.value.rawValue = image;
				};
				image.addEventListener('load', onLoad);
			}
		}

		const TweakpaneImagePlugin = {
			id: 'input-image',
			type: 'input',
			css: '.tp-imgv{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-imgv{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-imgv:hover{background-color:var(--in-bg-h)}.tp-imgv:focus{background-color:var(--in-bg-f)}.tp-imgv:active{background-color:var(--in-bg-a)}.tp-imgv:disabled{opacity:0.5}.tp-imgv{cursor:pointer;display:grid;height:calc(var(--bld-us) * 3);overflow:hidden;position:relative}.tp-imgv.tp-v-disabled{opacity:0.5}.tp-imgv_input{width:100%;height:100%;opacity:0}.tp-imgv_image{width:100%;height:100%;-o-object-fit:cover;object-fit:cover;position:absolute;pointer-events:none;border:0}',
			accept(exValue, params) {
				if (!(exValue instanceof HTMLImageElement)) {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					extensions: p.optional.string
				});
				if (!result) {
					return null;
				}
				return {
					initialValue: exValue,
					params: result
				};
			},
			binding: {
				reader(_args) {
					return (exValue) => {
						return exValue instanceof HTMLImageElement ? exValue : document.createElement('img');
					};
				},
				writer(_args) {
					return (target, inValue) => {
						target.write(inValue);
					};
				}
			},
			controller(args) {
				var _a;
				return new PluginController(args.document, {
					value: args.value,
					extensions: ((_a = args.params.extensions) !== null && _a !== void 0 ? _a : '')
						.replace(/\s/g, '')
						.split(','),
					viewProps: args.viewProps
				});
			}
		};

		const plugin = TweakpaneImagePlugin;

		exports.plugin = plugin;

		Object.defineProperty(exports, '__esModule', { value: true });
	});
});

var ImagePlugin = /*#__PURE__*/ Object.freeze(
	/*#__PURE__*/ _mergeNamespaces(
		{
			__proto__: null,
			default: tweakpaneImagePlugin,
			__moduleExports: tweakpaneImagePlugin
		},
		[tweakpaneImagePlugin]
	)
);

class PierogiControl extends IngredientControl {
	constructor() {
		super(...arguments);
		this.type = 'pierogi';
	}
	default(id, coords) {
		let defaultParameters = {
			image: new Image(),
			width: 0,
			height: 0
		};
		let defaultRacks = { in: {}, out: {} };
		for (let parameterName in defaultParameters) {
			defaultRacks.out[parameterName] = {
				parameterType: ParameterType.number
			};
		}
		return {
			nodeId: id,
			type: this.type,
			coords: writable(coords),
			parameters: writable(defaultParameters),
			racks: defaultRacks,
			dockedStatus: writable({ docked: false })
		};
	}
	attach(pane, params, store) {
		pane.registerPlugin(ImagePlugin);
		let imageInput = pane
			.addInput(params, 'image', {
				extensions: '.jpg, .png, .gif, .mp4'
			})
			.on('change', (ev) => {
				store.set({
					image: ev.value,
					width: ev.value.width,
					height: ev.value.height
				});
			});
		let widthInput = pane.addMonitor(params, 'width', {
			disabled: true,
			format: (h) => h.toString()
		});
		let heightInput = pane.addMonitor(params, 'height', {
			disabled: true,
			format: (h) => h.toString()
		});
		return {
			image: imageInput,
			width: widthInput,
			height: heightInput
		};
	}
}

class ColorControl extends IngredientControl {
	constructor() {
		super(...arguments);
		this.type = 'color';
	}
	default(id, coords) {
		const defaultParameters = {
			color: {
				r: 120,
				g: 150,
				b: 190
			}
		};
		const defaultRacks = {
			in: {},
			out: { color: { parameterType: ParameterType.color } }
		};
		return {
			nodeId: id,
			type: this.type,
			coords: writable(coords),
			parameters: writable(defaultParameters),
			racks: defaultRacks,
			dockedStatus: writable({ docked: false })
		};
	}
	attach(pane, params, store) {
		let colorInput = pane.addInput(params, 'color').on('change', (ev) => {
			store.set({
				color: {
					r: ev.value.r,
					g: ev.value.g,
					b: ev.value.b
				}
			});
		});
		return {
			color: colorInput
		};
	}
}

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
	// lazy load so that environments that need to polyfill have a chance to do so
	if (!getRandomValues) {
		// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
		// find the complete implementation of crypto (msCrypto) on IE11.
		getRandomValues =
			(typeof crypto !== 'undefined' &&
				crypto.getRandomValues &&
				crypto.getRandomValues.bind(crypto)) ||
			(typeof msCrypto !== 'undefined' &&
				typeof msCrypto.getRandomValues === 'function' &&
				msCrypto.getRandomValues.bind(msCrypto));

		if (!getRandomValues) {
			throw new Error(
				'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
			);
		}
	}

	return getRandomValues(rnds8);
}

var REGEX =
	/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
	return typeof uuid === 'string' && REGEX.test(uuid);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
	byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
	var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	// Note: Be careful editing this code!  It's been tuned for performance
	// and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
	var uuid = (
		byteToHex[arr[offset + 0]] +
		byteToHex[arr[offset + 1]] +
		byteToHex[arr[offset + 2]] +
		byteToHex[arr[offset + 3]] +
		'-' +
		byteToHex[arr[offset + 4]] +
		byteToHex[arr[offset + 5]] +
		'-' +
		byteToHex[arr[offset + 6]] +
		byteToHex[arr[offset + 7]] +
		'-' +
		byteToHex[arr[offset + 8]] +
		byteToHex[arr[offset + 9]] +
		'-' +
		byteToHex[arr[offset + 10]] +
		byteToHex[arr[offset + 11]] +
		byteToHex[arr[offset + 12]] +
		byteToHex[arr[offset + 13]] +
		byteToHex[arr[offset + 14]] +
		byteToHex[arr[offset + 15]]
	).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
	// of the following:
	// - One or more input array values don't map to a hex octet (leading to
	// "undefined" in the uuid)
	// - Invalid input values for the RFC `version` or `variant` fields

	if (!validate(uuid)) {
		throw TypeError('Stringified UUID is invalid');
	}

	return uuid;
}

function v4(options, buf, offset) {
	options = options || {};
	var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

	rnds[6] = (rnds[6] & 0x0f) | 0x40;
	rnds[8] = (rnds[8] & 0x3f) | 0x80; // Copy bytes to buffer, if provided

	if (buf) {
		offset = offset || 0;

		for (var i = 0; i < 16; ++i) {
			buf[offset + i] = rnds[i];
		}

		return buf;
	}

	return stringify(rnds);
}

const nodesStore = writable({});
derived(nodesStore, (nodes) => {
	return Object.entries(nodes).reduce((nodesRacks, [nodeId, node]) => {
		nodesRacks[nodeId] = node.racks;
		return nodesRacks;
	}, {});
});
function addNode(node) {
	nodesStore.update(($nodes) => {
		$nodes[node.nodeId] = node;
		return $nodes;
	});
}
function updateNode(node) {
	nodesStore.update(($nodes) => {
		$nodes[node.nodeId] = node;
		return $nodes;
	});
}
function removeNode(node) {
	nodesStore.update(($nodes) => {
		delete $nodes[node.nodeId];
		return $nodes;
	});
}
// each dock subscribes to this and does its own checking
const droppedNodeCoordsStore = writable();

var cssVars = (e, t) => (
	Object.entries(t).forEach(([t, r]) => {
		e.style.setProperty(`--${t}`, r);
	}),
	{
		update(r) {
			Object.entries(r).forEach(([r, o]) => {
				e.style.setProperty(`--${r}`, o), delete t[r];
			}),
				Object.keys(t).forEach((t) => e.style.removeProperty(`--${t}`)),
				(t = r);
		}
	}
);

const terminalHeight = 10;
var TerminalDirection;
(function (TerminalDirection) {
	TerminalDirection['in'] = 'in';
	TerminalDirection['out'] = 'out';
})(TerminalDirection || (TerminalDirection = {}));
const allNodesTerminalCentersStore = derived(
	[nodesStore, connectionsStore],
	([nodes, connections]) => {
		let connectionCenters = [];
		Object.entries(connections).forEach(([connectionId, connection]) => {
			// the context is keyed by nodeId as a string
			// using an object key requires matching the reference
			// maybe pass down through props
			let inNodeId = connection.in.nodeId;
			// do the same for out
			let outNodeId = connection.out.nodeId;
			// add to the callbacks set for the given connection's "in" parameter name
			// this corresponds to the in (left) terminal on parameters
			// using a store to ultimately notify terminals of a new callback to use when
			// they providing updates on their bounding rect
			// use the out callback
			connectionCenters.push({
				nodeId: inNodeId,
				direction: TerminalDirection.In,
				parameterName: connection.in.parameterName,
				connectionId: connectionId,
				parameterType: connection.parameterType,
				coords: writable({ x: undefined, y: undefined })
			});
			connectionCenters.push({
				nodeId: outNodeId,
				direction: TerminalDirection.Out,
				parameterName: connection.out.parameterName,
				connectionId: connectionId,
				parameterType: connection.parameterType,
				coords: writable({ x: undefined, y: undefined })
			});
		});
		let novelCenters = [];
		Object.entries(nodes).forEach(([nodeId, node]) => {
			Object.entries(node.racks.in).forEach(([parameterName, inRack]) => {
				if (
					!connectionCenters.find((center) => {
						return (
							center.direction == TerminalDirection.In &&
							center.parameterName == parameterName &&
							center.nodeId == nodeId
						);
					})
				) {
					const novelCenter = {
						nodeId: nodeId,
						direction: TerminalDirection.In,
						parameterName: parameterName,
						connectionId: null,
						parameterType: inRack.parameterType,
						coords: writable({ x: undefined, y: undefined })
					};
					novelCenters.push(novelCenter);
				}
			});
			Object.entries(node.racks.out).forEach(([parameterName, outRack]) => {
				const novelCenter = {
					nodeId: nodeId,
					direction: TerminalDirection.Out,
					parameterName: parameterName,
					connectionId: null,
					parameterType: outRack.parameterType,
					coords: writable({ x: undefined, y: undefined })
				};
				novelCenters.push(novelCenter);
			});
		});
		return connectionCenters.concat(novelCenters);
	}
);

function calculateCenter(rect) {
	let x = rect.x + rect.width / 2;
	let y = rect.y + rect.height / 2;
	return { x, y };
}
function checkPointWithinBox(point, box) {
	// if x within width and y within height, point is within
	if (point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom) {
		return true;
	} else {
		return false;
	}
}

// object describing the live cable for target terminals
// including callback should a new connection happen in ui
const liveConnectionStore = writable(null);
function anchorLiveConnection(
	connectionId,
	anchorNodeId,
	anchorParameterName,
	anchorDirection,
	dragDirection,
	parameterType,
	location
) {
	let attach;
	// when a terminal gets a mouseup, add a new connection depending on the in/out
	if (anchorDirection == TerminalDirection.In) {
		attach = (targetNodeId, targetParameterName, existingConnectionId) => {
			// if this terminal is already connected, just update the connection's state to the new
			// node id, parameter name,
			let connectionState = {
				connectionId: connectionId,
				parameterType: parameterType,
				in: {
					nodeId: anchorNodeId,
					parameterName: anchorParameterName
				},
				out: {
					nodeId: targetNodeId,
					parameterName: targetParameterName
				}
			};
			if (existingConnectionId) {
				connectionState.connectionId = existingConnectionId;
				updateConnection(connectionState);
			} else {
				addConnection(connectionState);
			}
			// need to delete live connection here
			liveConnectionStore.set(null);
		};
	} else {
		attach = (targetNodeId, targetParameterName, existingConnectionId) => {
			let connectionState = {
				connectionId: connectionId,
				parameterType: parameterType,
				in: {
					nodeId: targetNodeId,
					parameterName: targetParameterName
				},
				out: {
					nodeId: anchorNodeId,
					parameterName: anchorParameterName
				}
			};
			if (existingConnectionId) {
				connectionState.connectionId = existingConnectionId;
				updateConnection(connectionState);
			} else {
				addConnection(connectionState);
			}
			liveConnectionStore.set(null);
		};
	}
	liveConnectionStore.set({
		connectionId: connectionId,
		anchorNodeId: anchorNodeId,
		anchorParameterName: anchorParameterName,
		parameterType: parameterType,
		anchorTerminalDirection: anchorDirection,
		dragTerminalDirection: dragDirection,
		dragCoordsStore: writable(location),
		anchorCoordsStore: writable({ x: undefined, y: undefined }),
		attach: attach
	});
}
const dropCableStore = derived(
	[liveConnectionStore, allNodesTerminalCentersStore],
	([liveConnection, allNodesTerminalCenters]) => {
		// this subscription fires before the element is deleted
		return (coords) => {
			if (liveConnection) {
				const targetTerminals = allNodesTerminalCenters.filter((nodeTerminalCenter) => {
					return (
						liveConnection.parameterType == nodeTerminalCenter.parameterType &&
						liveConnection.dragTerminalDirection == nodeTerminalCenter.direction &&
						!(
							liveConnection.anchorNodeId == nodeTerminalCenter.nodeId &&
							liveConnection.anchorParameterName == nodeTerminalCenter.parameterName
						)
					);
				});
				const nearTerminalDistance = 4;
				// expanding the rect
				const targetTerminal = targetTerminals.find((terminalCenter) => {
					const terminalCoords = get_store_value(terminalCenter.coords);
					const left = terminalCoords.x - (terminalHeight / 2 + nearTerminalDistance);
					const top = terminalCoords.y - (terminalHeight / 2 + nearTerminalDistance);
					const right = terminalCoords.x + (terminalHeight / 2 + nearTerminalDistance);
					const bottom = terminalCoords.y + (terminalHeight / 2 + nearTerminalDistance);
					return checkPointWithinBox(
						{ x: coords.x, y: coords.y },
						{ top: top, bottom: bottom, left: left, right: right }
					);
				});
				// use the callback from the liveConnection store
				if (targetTerminal) {
					liveConnection.attach(
						targetTerminal.nodeId,
						targetTerminal.parameterName,
						targetTerminal.connectionId
					);
				} else {
					liveConnectionStore.set(null);
				}
			}
		};
	}
);

function checkNearAction(element, nearDistance) {
	let near = false;
	let checkNear = (event) => {
		let rect = element.getBoundingClientRect();
		// expanding the rect
		let left = rect.left - nearDistance;
		let top = rect.top - nearDistance;
		let right = rect.right + nearDistance;
		let bottom = rect.bottom + nearDistance;
		near = checkPointWithinBox(
			{ x: event.pageX, y: event.pageY },
			{ top: top, bottom: bottom, left: left, right: right }
		);
		element.dispatchEvent(new CustomEvent('near', { detail: near }));
	};
	window.addEventListener('mousemove', checkNear);
	return {
		update(newNearDistance) {
			nearDistance = newNearDistance;
		},
		destroy() {
			window.removeEventListener('mousemove', checkNear);
		}
	};
}

// adapted from svelte-material-ui
// https://github.com/hperrin/svelte-material-ui/blob/59e1069f5f56119622e2f4fbfdd4e53f7bde4682/packages/common/src/internal/useActions.ts
function useActions(node, actions) {
	let actionHandles = [];
	if (actions) {
		actions.forEach((action, i) => {
			if (action.params) {
				actionHandles.push(action.action(node, action.params));
			} else {
				actionHandles.push(action.action(node));
			}
		});
	}
	return {
		update(newActions) {
			// if actions changes, destroy the old handles and attach the new ones
			if (actions != newActions) {
				actions = newActions;
				actionHandles.forEach((handle) => {
					if (handle && handle.destroy) {
						handle.destroy();
					}
				});
				actionHandles = [];
				newActions.forEach((action, i) => {
					if (action.params) {
						actionHandles.push(action.action(node, action.params));
					} else {
						actionHandles.push(action.action(node));
					}
				});
			}
			// update all of the handles
			if (newActions) {
				newActions.forEach((action, i) => {
					let handle = actionHandles[i];
					if (handle && handle.update) {
						if (action.params) {
							handle.update(action.params);
						} else {
							handle.update();
						}
					}
				});
			}
		},
		destroy() {
			actionHandles.forEach((handle) => {
				if (handle && handle.destroy) {
					handle.destroy();
				}
			});
		}
	};
}

/* src/terminals/Terminal.svelte generated by Svelte v3.44.2 */

function create_fragment$9(ctx) {
	let div;
	let div_class_value;
	let useActions_action;
	let cssVars_action;
	let mounted;
	let dispose;

	return {
		c() {
			div = element('div');
			attr(div, 'class', (div_class_value = 'terminal ' + /*direction*/ ctx[0] + ' svelte-5d9eed'));
			toggle_class(div, 'expanded', /*expanded*/ ctx[1]);
			toggle_class(div, 'cabled', /*cabled*/ ctx[2]);
			toggle_class(div, 'live', /*live*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (!mounted) {
				dispose = [
					action_destroyer(
						(useActions_action = useActions.call(null, div, /*actionDescriptions*/ ctx[4]))
					),
					action_destroyer((cssVars_action = cssVars.call(null, div, /*styleVars*/ ctx[5])))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (
				dirty & /*direction*/ 1 &&
				div_class_value !==
					(div_class_value = 'terminal ' + /*direction*/ ctx[0] + ' svelte-5d9eed')
			) {
				attr(div, 'class', div_class_value);
			}

			if (
				useActions_action &&
				is_function(useActions_action.update) &&
				dirty & /*actionDescriptions*/ 16
			)
				useActions_action.update.call(null, /*actionDescriptions*/ ctx[4]);
			if (cssVars_action && is_function(cssVars_action.update) && dirty & /*styleVars*/ 32)
				cssVars_action.update.call(null, /*styleVars*/ ctx[5]);

			if (dirty & /*direction, expanded*/ 3) {
				toggle_class(div, 'expanded', /*expanded*/ ctx[1]);
			}

			if (dirty & /*direction, cabled*/ 5) {
				toggle_class(div, 'cabled', /*cabled*/ ctx[2]);
			}

			if (dirty & /*direction, live*/ 9) {
				toggle_class(div, 'live', /*live*/ ctx[3]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let styleVars;
	let { direction } = $$props;
	let { expanded } = $$props;
	let { terminalHeight } = $$props;
	let { cabled } = $$props;
	let { live = false } = $$props;
	let { actionDescriptions } = $$props;

	$$self.$$set = ($$props) => {
		if ('direction' in $$props) $$invalidate(0, (direction = $$props.direction));
		if ('expanded' in $$props) $$invalidate(1, (expanded = $$props.expanded));
		if ('terminalHeight' in $$props) $$invalidate(6, (terminalHeight = $$props.terminalHeight));
		if ('cabled' in $$props) $$invalidate(2, (cabled = $$props.cabled));
		if ('live' in $$props) $$invalidate(3, (live = $$props.live));
		if ('actionDescriptions' in $$props)
			$$invalidate(4, (actionDescriptions = $$props.actionDescriptions));
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*terminalHeight*/ 64) {
			$$invalidate(5, (styleVars = { terminalHeight: terminalHeight + 'px' }));
		}
	};

	return [direction, expanded, cabled, live, actionDescriptions, styleVars, terminalHeight];
}

class Terminal extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
			direction: 0,
			expanded: 1,
			terminalHeight: 6,
			cabled: 2,
			live: 3,
			actionDescriptions: 4
		});
	}
}

/* src/terminals/TerminalRack.svelte generated by Svelte v3.44.2 */

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[20] = list[i][0];
	child_ctx[21] = list[i][1];
	return child_ctx;
}

// (223:4) {#each Object.entries(terminals) as [connectionId, terminal] (connectionId)}
function create_each_block$3(key_1, ctx) {
	let first;
	let terminal;
	let current;

	terminal = new Terminal({
		props: {
			actionDescriptions: /*terminal*/ ctx[21].actionDescriptions,
			cabled: /*terminal*/ ctx[21].cabled,
			direction: /*direction*/ ctx[1],
			expanded: /*expanded*/ ctx[4],
			terminalHeight
		}
	});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(terminal.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(terminal, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const terminal_changes = {};
			if (dirty & /*terminals*/ 8)
				terminal_changes.actionDescriptions = /*terminal*/ ctx[21].actionDescriptions;
			if (dirty & /*terminals*/ 8) terminal_changes.cabled = /*terminal*/ ctx[21].cabled;
			if (dirty & /*direction*/ 2) terminal_changes.direction = /*direction*/ ctx[1];
			if (dirty & /*expanded*/ 16) terminal_changes.expanded = /*expanded*/ ctx[4];
			terminal.$set(terminal_changes);
		},
		i(local) {
			if (current) return;
			transition_in(terminal.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(terminal.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(terminal, detaching);
		}
	};
}

function create_fragment$8(ctx) {
	let div1;
	let div0;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let cssVars_action;
	let div1_class_value;
	let cssVars_action_1;
	let current;
	let mounted;
	let dispose;
	let each_value = Object.entries(/*terminals*/ ctx[3]);
	const get_key = (ctx) => /*connectionId*/ ctx[20];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$3(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, (each_blocks[i] = create_each_block$3(key, child_ctx)));
	}

	return {
		c() {
			div1 = element('div');
			div0 = element('div');

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, 'class', 'terminals-container svelte-ap9ki6');
			toggle_class(div0, 'expanded', /*expanded*/ ctx[4]);
			attr(
				div1,
				'class',
				(div1_class_value = 'terminal-rack ' + /*direction*/ ctx[1] + ' svelte-ap9ki6')
			);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			/*div1_binding*/ ctx[13](div1);
			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer((cssVars_action = cssVars.call(null, div0, /*styleVars*/ ctx[5]))),
					action_destroyer((cssVars_action_1 = cssVars.call(null, div1, /*styleVars*/ ctx[5]))),
					action_destroyer(checkNearAction.call(null, div1, nearTerminalRackDistance)),
					listen(div1, 'near', /*near_handler*/ ctx[14])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*Object, terminals, direction, expanded, terminalHeight*/ 26) {
				each_value = Object.entries(/*terminals*/ ctx[3]);
				group_outros();
				each_blocks = update_keyed_each(
					each_blocks,
					dirty,
					get_key,
					1,
					ctx,
					each_value,
					each_1_lookup,
					div0,
					outro_and_destroy_block,
					create_each_block$3,
					null,
					get_each_context$3
				);
				check_outros();
			}

			if (cssVars_action && is_function(cssVars_action.update) && dirty & /*styleVars*/ 32)
				cssVars_action.update.call(null, /*styleVars*/ ctx[5]);

			if (dirty & /*expanded*/ 16) {
				toggle_class(div0, 'expanded', /*expanded*/ ctx[4]);
			}

			if (
				!current ||
				(dirty & /*direction*/ 2 &&
					div1_class_value !==
						(div1_class_value = 'terminal-rack ' + /*direction*/ ctx[1] + ' svelte-ap9ki6'))
			) {
				attr(div1, 'class', div1_class_value);
			}

			if (cssVars_action_1 && is_function(cssVars_action_1.update) && dirty & /*styleVars*/ 32)
				cssVars_action_1.update.call(null, /*styleVars*/ ctx[5]);
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*div1_binding*/ ctx[13](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

const NOVEL_CONNECTION_ID = 'novel';
const nearTerminalRackDistance = 12;
const rackHeight = 20;
const paneOffset = 6;

function instance$8($$self, $$props, $$invalidate) {
	let connectionIds;
	let expanded;
	let rackWidth;
	let styleVars;
	let $nodeTerminalRectCenterStores;
	let $connectionsStore;
	component_subscribe($$self, connectionsStore, ($$value) =>
		$$invalidate(15, ($connectionsStore = $$value))
	);
	let { direction } = $$props;
	let { container } = $$props;
	let near = false;
	let { parameterName } = $$props;
	let { parameterType } = $$props;
	const nodeId = getContext('nodeId');

	// get store containing coord stores to use to broadcast bounding rect
	// look for matching node, parameter name, direction
	const nodeTerminalRectCenterStores = derived(
		[allNodesTerminalCentersStore, liveConnectionStore],
		([allNodeTerminalCenters, liveConnection]) => {
			let nodeCenters = allNodeTerminalCenters.filter((center) => {
				return (
					center.nodeId == nodeId &&
					center.direction == direction &&
					center.parameterName == parameterName
				);
			});

			let centerStores = nodeCenters.reduce((currentCenterStores, center) => {
				if (center.connectionId) {
					currentCenterStores[center.connectionId] = center;
				} else {
					currentCenterStores[NOVEL_CONNECTION_ID] = center;
				}

				return currentCenterStores;
			}, {});

			// add a rect center store to update from the live connection
			if (
				liveConnection &&
				liveConnection.anchorNodeId == nodeId &&
				liveConnection.anchorTerminalDirection == direction &&
				liveConnection.anchorParameterName == parameterName
			) {
				centerStores[liveConnection.connectionId] = {
					nodeId,
					direction,
					parameterName,
					connectionId: liveConnection.connectionId,
					parameterType: liveConnection.parameterType,
					coords: liveConnection.anchorCoordsStore
				};

				if (direction == TerminalDirection.In) {
					delete centerStores[NOVEL_CONNECTION_ID];
				}
			}

			return centerStores;
		},
		{}
	);

	component_subscribe($$self, nodeTerminalRectCenterStores, (value) =>
		$$invalidate(12, ($nodeTerminalRectCenterStores = value))
	);

	function terminalCenterUpdateAction(element, params) {
		let updateRect = () => {
			// don't bother if there are none to call
			if (
				$nodeTerminalRectCenterStores &&
				Object.entries($nodeTerminalRectCenterStores).length > 0
			) {
				// calculate the rect and dispatch to the callback
				let rect = element.getBoundingClientRect();

				// accounts for scroll
				rect.x += window.pageXOffset;

				rect.y += window.pageYOffset;
				let center = calculateCenter(rect);
				$nodeTerminalRectCenterStores[params.connectionId].coords.set({ x: center.x, y: center.y });
			}
		};

		let rectUpdateInterval = setInterval(updateRect, 10);

		return {
			update(newParams) {
				params = newParams;
			},
			destroy() {
				clearInterval(rectUpdateInterval);
			}
		};
	}

	let usingNovelTerminal = false;

	// grabbing novel terminal should start relaying the coords of the terminal
	// and add event listeners for release
	function handleNovelGrabAction(element, params) {
		const handleMouseUp = (event) => {
			$$invalidate(9, (usingNovelTerminal = false));
			window.removeEventListener('mouseup', handleMouseUp);
			element.style.cursor = '';
		};

		const handleNovelGrab = (event) => {
			if (event.button == 0) {
				const dragDirection =
					direction == TerminalDirection.In ? TerminalDirection.Out : TerminalDirection.In;

				anchorLiveConnection(
					params.connectionId,
					nodeId,
					parameterName,
					direction,
					dragDirection,
					parameterType,
					{ x: event.x, y: event.y }
				);
				$$invalidate(9, (usingNovelTerminal = true));
				window.addEventListener('mouseup', handleMouseUp);
				element.style.cursor = 'grabbing';
			}
		};

		element.addEventListener('mousedown', handleNovelGrab);

		return {
			update(newParams) {
				params = newParams;
			},
			destroy() {
				element.removeEventListener('mousedown', handleNovelGrab);
			}
		};
	}

	function handleDisconnectGrabAction(element, params) {
		let handleMouseUp = () => {
			element.style.cursor = '';
			window.removeEventListener('mouseup', handleMouseUp);
		};

		let handleDisconnectGrab = (event) => {
			if (event.button == 0) {
				let location = { x: event.x, y: event.y };
				const connection = $connectionsStore[params.connectionId];

				// anchorDirection is the opposite of the direction that engaged
				// this callback
				const anchorDirection =
					direction == TerminalDirection.In ? TerminalDirection.Out : TerminalDirection.In;

				const parameterType = connection.parameterType;
				const { nodeId: anchorNodeId, parameterName: anchorParameterName } =
					connection[anchorDirection];
				removeConnection(params.connectionId);
				anchorLiveConnection(
					params.connectionId,
					anchorNodeId,
					anchorParameterName,
					anchorDirection,
					direction,
					parameterType,
					location
				);
				element.style.cursor = 'grabbing';
				window.addEventListener('mouseup', handleMouseUp);
			}
		};

		element.addEventListener('mousedown', handleDisconnectGrab);

		return {
			update(newParams) {
				params = newParams;
			},
			destroy() {
				element.removeEventListener('mousedown', handleDisconnectGrab);
			}
		};
	}

	let terminals;

	function div1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			container = $$value;
			$$invalidate(0, container);
		});
	}

	const near_handler = (event) => {
		$$invalidate(2, (near = event.detail));
	};

	$$self.$$set = ($$props) => {
		if ('direction' in $$props) $$invalidate(1, (direction = $$props.direction));
		if ('container' in $$props) $$invalidate(0, (container = $$props.container));
		if ('parameterName' in $$props) $$invalidate(7, (parameterName = $$props.parameterName));
		if ('parameterType' in $$props) $$invalidate(8, (parameterType = $$props.parameterType));
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$nodeTerminalRectCenterStores*/ 4096) {
			$$invalidate(
				11,
				(connectionIds = $nodeTerminalRectCenterStores
					? Object.keys($nodeTerminalRectCenterStores)
					: [])
			);
		}

		if ($$self.$$.dirty & /*near, usingNovelTerminal*/ 516) {
			$$invalidate(4, (expanded = near || usingNovelTerminal));
		}

		if ($$self.$$.dirty & /*connectionIds, terminals*/ 2056) {
			{
				let showNovelTerminal;

				$$invalidate(
					3,
					(terminals = [...connectionIds].reduce((result, connectionId) => {
						if (connectionId != NOVEL_CONNECTION_ID) {
							const terminal = {
								actionDescriptions: [
									{
										action: terminalCenterUpdateAction,
										params: { connectionId }
									},
									{
										action: handleDisconnectGrabAction,
										params: { connectionId }
									}
								],
								cabled: true
							};

							result.push(terminal);
						} else {
							showNovelTerminal = true;
						}

						return result;
					}, []))
				);

				if (showNovelTerminal) {
					const novelTerminal = {
						actionDescriptions: [
							{
								action: terminalCenterUpdateAction,
								params: { connectionId: NOVEL_CONNECTION_ID }
							},
							{
								action: handleNovelGrabAction,
								params: { connectionId: v4() }
							}
						],
						cabled: false
					};

					terminals.push(novelTerminal);
				}
			}
		}

		if ($$self.$$.dirty & /*expanded, terminals*/ 24) {
			// if expanded, take a width dependent on the number of terminals
			// 1 more terminal than there are connections
			$$invalidate(
				10,
				(rackWidth = !expanded
					? 4
					: ((rackHeight - terminalHeight) / 2) * (terminals.length + 1) +
					  terminalHeight * terminals.length)
			);
		}

		if ($$self.$$.dirty & /*rackWidth*/ 1024) {
			$$invalidate(
				5,
				(styleVars = {
					rackWidth: rackWidth + 'px',
					rackHeight: rackHeight + 'px',
					paneOffset: paneOffset + 'px'
				})
			);
		}
	};

	return [
		container,
		direction,
		near,
		terminals,
		expanded,
		styleVars,
		nodeTerminalRectCenterStores,
		parameterName,
		parameterType,
		usingNovelTerminal,
		rackWidth,
		connectionIds,
		$nodeTerminalRectCenterStores,
		div1_binding,
		near_handler
	];
}

class TerminalRack extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
			direction: 1,
			container: 0,
			parameterName: 7,
			parameterType: 8
		});
	}
}

var tweakpane = createCommonjsModule(function (module, exports) {
	/*! Tweakpane 3.0.6 (c) 2016 cocopon, licensed under the MIT license. */
	(function (global, factory) {
		factory(exports);
	})(commonjsGlobal, function (exports) {
		/***
		 * A simple semantic versioning perser.
		 */
		class Semver {
			/**
			 * @hidden
			 */
			constructor(text) {
				const [core, prerelease] = text.split('-');
				const coreComps = core.split('.');
				this.major = parseInt(coreComps[0], 10);
				this.minor = parseInt(coreComps[1], 10);
				this.patch = parseInt(coreComps[2], 10);
				this.prerelease = prerelease !== null && prerelease !== void 0 ? prerelease : null;
			}
			toString() {
				const core = [this.major, this.minor, this.patch].join('.');
				return this.prerelease !== null ? [core, this.prerelease].join('-') : core;
			}
		}

		class BladeApi {
			constructor(controller) {
				this.controller_ = controller;
			}
			get disabled() {
				return this.controller_.viewProps.get('disabled');
			}
			set disabled(disabled) {
				this.controller_.viewProps.set('disabled', disabled);
			}
			get hidden() {
				return this.controller_.viewProps.get('hidden');
			}
			set hidden(hidden) {
				this.controller_.viewProps.set('hidden', hidden);
			}
			dispose() {
				this.controller_.viewProps.set('disposed', true);
			}
		}

		class TpEvent {
			constructor(target) {
				this.target = target;
			}
		}
		class TpChangeEvent extends TpEvent {
			constructor(target, value, presetKey, last) {
				super(target);
				this.value = value;
				this.presetKey = presetKey;
				this.last = last !== null && last !== void 0 ? last : true;
			}
		}
		class TpUpdateEvent extends TpEvent {
			constructor(target, value, presetKey) {
				super(target);
				this.value = value;
				this.presetKey = presetKey;
			}
		}
		class TpFoldEvent extends TpEvent {
			constructor(target, expanded) {
				super(target);
				this.expanded = expanded;
			}
		}

		function forceCast(v) {
			return v;
		}
		function isEmpty(value) {
			return value === null || value === undefined;
		}
		function deepEqualsArray(a1, a2) {
			if (a1.length !== a2.length) {
				return false;
			}
			for (let i = 0; i < a1.length; i++) {
				if (a1[i] !== a2[i]) {
					return false;
				}
			}
			return true;
		}

		const CREATE_MESSAGE_MAP = {
			alreadydisposed: () => 'View has been already disposed',
			invalidparams: (context) => `Invalid parameters for '${context.name}'`,
			nomatchingcontroller: (context) => `No matching controller for '${context.key}'`,
			nomatchingview: (context) => `No matching view for '${JSON.stringify(context.params)}'`,
			notbindable: () => `Value is not bindable`,
			propertynotfound: (context) => `Property '${context.name}' not found`,
			shouldneverhappen: () => 'This error should never happen'
		};
		class TpError {
			constructor(config) {
				var _a;
				this.message =
					(_a = CREATE_MESSAGE_MAP[config.type](forceCast(config.context))) !== null &&
					_a !== void 0
						? _a
						: 'Unexpected error';
				this.name = this.constructor.name;
				this.stack = new Error(this.message).stack;
				this.type = config.type;
			}
			static alreadyDisposed() {
				return new TpError({ type: 'alreadydisposed' });
			}
			static notBindable() {
				return new TpError({
					type: 'notbindable'
				});
			}
			static propertyNotFound(name) {
				return new TpError({
					type: 'propertynotfound',
					context: {
						name: name
					}
				});
			}
			static shouldNeverHappen() {
				return new TpError({ type: 'shouldneverhappen' });
			}
		}

		class BindingTarget {
			constructor(obj, key, opt_id) {
				this.obj_ = obj;
				this.key_ = key;
				this.presetKey_ = opt_id !== null && opt_id !== void 0 ? opt_id : key;
			}
			static isBindable(obj) {
				if (obj === null) {
					return false;
				}
				if (typeof obj !== 'object') {
					return false;
				}
				return true;
			}
			get key() {
				return this.key_;
			}
			get presetKey() {
				return this.presetKey_;
			}
			read() {
				return this.obj_[this.key_];
			}
			write(value) {
				this.obj_[this.key_] = value;
			}
			writeProperty(name, value) {
				const valueObj = this.read();
				if (!BindingTarget.isBindable(valueObj)) {
					throw TpError.notBindable();
				}
				if (!(name in valueObj)) {
					throw TpError.propertyNotFound(name);
				}
				valueObj[name] = value;
			}
		}

		class ButtonApi extends BladeApi {
			get label() {
				return this.controller_.props.get('label');
			}
			set label(label) {
				this.controller_.props.set('label', label);
			}
			get title() {
				var _a;
				return (_a = this.controller_.valueController.props.get('title')) !== null && _a !== void 0
					? _a
					: '';
			}
			set title(title) {
				this.controller_.valueController.props.set('title', title);
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				const emitter = this.controller_.valueController.emitter;
				emitter.on(eventName, () => {
					bh(new TpEvent(this));
				});
				return this;
			}
		}

		class Emitter {
			constructor() {
				this.observers_ = {};
			}
			on(eventName, handler) {
				let observers = this.observers_[eventName];
				if (!observers) {
					observers = this.observers_[eventName] = [];
				}
				observers.push({
					handler: handler
				});
				return this;
			}
			off(eventName, handler) {
				const observers = this.observers_[eventName];
				if (observers) {
					this.observers_[eventName] = observers.filter((observer) => {
						return observer.handler !== handler;
					});
				}
				return this;
			}
			emit(eventName, event) {
				const observers = this.observers_[eventName];
				if (!observers) {
					return;
				}
				observers.forEach((observer) => {
					observer.handler(event);
				});
			}
		}

		const PREFIX = 'tp';
		function ClassName(viewName) {
			const fn = (opt_elementName, opt_modifier) => {
				return [
					PREFIX,
					'-',
					viewName,
					'v',
					opt_elementName ? `_${opt_elementName}` : '',
					opt_modifier ? `-${opt_modifier}` : ''
				].join('');
			};
			return fn;
		}

		function compose(h1, h2) {
			return (input) => h2(h1(input));
		}
		function extractValue(ev) {
			return ev.rawValue;
		}
		function bindValue(value, applyValue) {
			value.emitter.on('change', compose(extractValue, applyValue));
			applyValue(value.rawValue);
		}
		function bindValueMap(valueMap, key, applyValue) {
			bindValue(valueMap.value(key), applyValue);
		}

		function applyClass(elem, className, active) {
			if (active) {
				elem.classList.add(className);
			} else {
				elem.classList.remove(className);
			}
		}
		function valueToClassName(elem, className) {
			return (value) => {
				applyClass(elem, className, value);
			};
		}
		function bindValueToTextContent(value, elem) {
			bindValue(value, (text) => {
				elem.textContent = text !== null && text !== void 0 ? text : '';
			});
		}

		const className$q = ClassName('btn');
		class ButtonView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$q());
				config.viewProps.bindClassModifiers(this.element);
				const buttonElem = doc.createElement('button');
				buttonElem.classList.add(className$q('b'));
				config.viewProps.bindDisabled(buttonElem);
				this.element.appendChild(buttonElem);
				this.buttonElement = buttonElem;
				const titleElem = doc.createElement('div');
				titleElem.classList.add(className$q('t'));
				bindValueToTextContent(config.props.value('title'), titleElem);
				this.buttonElement.appendChild(titleElem);
			}
		}

		class ButtonController {
			constructor(doc, config) {
				this.emitter = new Emitter();
				this.onClick_ = this.onClick_.bind(this);
				this.props = config.props;
				this.viewProps = config.viewProps;
				this.view = new ButtonView(doc, {
					props: this.props,
					viewProps: this.viewProps
				});
				this.view.buttonElement.addEventListener('click', this.onClick_);
			}
			onClick_() {
				this.emitter.emit('click', {
					sender: this
				});
			}
		}

		class BoundValue {
			constructor(initialValue, config) {
				var _a;
				this.constraint_ = config === null || config === void 0 ? void 0 : config.constraint;
				this.equals_ =
					(_a = config === null || config === void 0 ? void 0 : config.equals) !== null &&
					_a !== void 0
						? _a
						: (v1, v2) => v1 === v2;
				this.emitter = new Emitter();
				this.rawValue_ = initialValue;
			}
			get constraint() {
				return this.constraint_;
			}
			get rawValue() {
				return this.rawValue_;
			}
			set rawValue(rawValue) {
				this.setRawValue(rawValue, {
					forceEmit: false,
					last: true
				});
			}
			setRawValue(rawValue, options) {
				const opts =
					options !== null && options !== void 0
						? options
						: {
								forceEmit: false,
								last: true
						  };
				const constrainedValue = this.constraint_ ? this.constraint_.constrain(rawValue) : rawValue;
				const changed = !this.equals_(this.rawValue_, constrainedValue);
				if (!changed && !opts.forceEmit) {
					return;
				}
				this.emitter.emit('beforechange', {
					sender: this
				});
				this.rawValue_ = constrainedValue;
				this.emitter.emit('change', {
					options: opts,
					rawValue: constrainedValue,
					sender: this
				});
			}
		}

		class PrimitiveValue {
			constructor(initialValue) {
				this.emitter = new Emitter();
				this.value_ = initialValue;
			}
			get rawValue() {
				return this.value_;
			}
			set rawValue(value) {
				this.setRawValue(value, {
					forceEmit: false,
					last: true
				});
			}
			setRawValue(value, options) {
				const opts =
					options !== null && options !== void 0
						? options
						: {
								forceEmit: false,
								last: true
						  };
				if (this.value_ === value && !opts.forceEmit) {
					return;
				}
				this.emitter.emit('beforechange', {
					sender: this
				});
				this.value_ = value;
				this.emitter.emit('change', {
					options: opts,
					rawValue: this.value_,
					sender: this
				});
			}
		}

		function createValue(initialValue, config) {
			const constraint = config === null || config === void 0 ? void 0 : config.constraint;
			const equals = config === null || config === void 0 ? void 0 : config.equals;
			if (!constraint && !equals) {
				return new PrimitiveValue(initialValue);
			}
			return new BoundValue(initialValue, config);
		}

		class ValueMap {
			constructor(valueMap) {
				this.emitter = new Emitter();
				this.valMap_ = valueMap;
				for (const key in this.valMap_) {
					const v = this.valMap_[key];
					v.emitter.on('change', () => {
						this.emitter.emit('change', {
							key: key,
							sender: this
						});
					});
				}
			}
			static createCore(initialValue) {
				const keys = Object.keys(initialValue);
				return keys.reduce((o, key) => {
					return Object.assign(o, {
						[key]: createValue(initialValue[key])
					});
				}, {});
			}
			static fromObject(initialValue) {
				const core = this.createCore(initialValue);
				return new ValueMap(core);
			}
			get(key) {
				return this.valMap_[key].rawValue;
			}
			set(key, value) {
				this.valMap_[key].rawValue = value;
			}
			value(key) {
				return this.valMap_[key];
			}
		}

		function parseObject(value, keyToParserMap) {
			const keys = Object.keys(keyToParserMap);
			const result = keys.reduce((tmp, key) => {
				if (tmp === undefined) {
					return undefined;
				}
				const parser = keyToParserMap[key];
				const result = parser(value[key]);
				return result.succeeded
					? Object.assign(Object.assign({}, tmp), { [key]: result.value })
					: undefined;
			}, {});
			return forceCast(result);
		}
		function parseArray(value, parseItem) {
			return value.reduce((tmp, item) => {
				if (tmp === undefined) {
					return undefined;
				}
				const result = parseItem(item);
				if (!result.succeeded || result.value === undefined) {
					return undefined;
				}
				return [...tmp, result.value];
			}, []);
		}
		function isObject(value) {
			if (value === null) {
				return false;
			}
			return typeof value === 'object';
		}
		function createParamsParserBuilder(parse) {
			return (optional) => (v) => {
				if (!optional && v === undefined) {
					return {
						succeeded: false,
						value: undefined
					};
				}
				if (optional && v === undefined) {
					return {
						succeeded: true,
						value: undefined
					};
				}
				const result = parse(v);
				return result !== undefined
					? {
							succeeded: true,
							value: result
					  }
					: {
							succeeded: false,
							value: undefined
					  };
			};
		}
		function createParamsParserBuilders(optional) {
			return {
				custom: (parse) => createParamsParserBuilder(parse)(optional),
				boolean: createParamsParserBuilder((v) => (typeof v === 'boolean' ? v : undefined))(
					optional
				),
				number: createParamsParserBuilder((v) => (typeof v === 'number' ? v : undefined))(optional),
				string: createParamsParserBuilder((v) => (typeof v === 'string' ? v : undefined))(optional),
				function: createParamsParserBuilder((v) => (typeof v === 'function' ? v : undefined))(
					optional
				),
				constant: (value) =>
					createParamsParserBuilder((v) => (v === value ? value : undefined))(optional),
				raw: createParamsParserBuilder((v) => v)(optional),
				object: (keyToParserMap) =>
					createParamsParserBuilder((v) => {
						if (!isObject(v)) {
							return undefined;
						}
						return parseObject(v, keyToParserMap);
					})(optional),
				array: (itemParser) =>
					createParamsParserBuilder((v) => {
						if (!Array.isArray(v)) {
							return undefined;
						}
						return parseArray(v, itemParser);
					})(optional)
			};
		}
		const ParamsParsers = {
			optional: createParamsParserBuilders(true),
			required: createParamsParserBuilders(false)
		};
		function parseParams(value, keyToParserMap) {
			const result = ParamsParsers.required.object(keyToParserMap)(value);
			return result.succeeded ? result.value : undefined;
		}

		function disposeElement(elem) {
			if (elem && elem.parentElement) {
				elem.parentElement.removeChild(elem);
			}
			return null;
		}

		function getAllBladePositions() {
			return ['veryfirst', 'first', 'last', 'verylast'];
		}

		const className$p = ClassName('');
		const POS_TO_CLASS_NAME_MAP = {
			veryfirst: 'vfst',
			first: 'fst',
			last: 'lst',
			verylast: 'vlst'
		};
		class BladeController {
			constructor(config) {
				this.parent_ = null;
				this.blade = config.blade;
				this.view = config.view;
				this.viewProps = config.viewProps;
				const elem = this.view.element;
				this.blade.value('positions').emitter.on('change', () => {
					getAllBladePositions().forEach((pos) => {
						elem.classList.remove(className$p(undefined, POS_TO_CLASS_NAME_MAP[pos]));
					});
					this.blade.get('positions').forEach((pos) => {
						elem.classList.add(className$p(undefined, POS_TO_CLASS_NAME_MAP[pos]));
					});
				});
				this.viewProps.handleDispose(() => {
					disposeElement(elem);
				});
			}
			get parent() {
				return this.parent_;
			}
		}

		const SVG_NS = 'http://www.w3.org/2000/svg';
		function forceReflow(element) {
			element.offsetHeight;
		}
		function disableTransitionTemporarily(element, callback) {
			const t = element.style.transition;
			element.style.transition = 'none';
			callback();
			element.style.transition = t;
		}
		function supportsTouch(doc) {
			return doc.ontouchstart !== undefined;
		}
		function getGlobalObject() {
			return new Function('return this')();
		}
		function getWindowDocument() {
			const globalObj = forceCast(getGlobalObject());
			return globalObj.document;
		}
		function isBrowser() {
			return 'document' in getGlobalObject();
		}
		function getCanvasContext(canvasElement) {
			return isBrowser() ? canvasElement.getContext('2d') : null;
		}
		const ICON_ID_TO_INNER_HTML_MAP = {
			check: '<path d="M2 8l4 4l8 -8"/>',
			dropdown: '<path d="M5 7h6l-3 3 z"/>',
			p2dpad: '<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'
		};
		function createSvgIconElement(document, iconId) {
			const elem = document.createElementNS(SVG_NS, 'svg');
			elem.innerHTML = ICON_ID_TO_INNER_HTML_MAP[iconId];
			return elem;
		}
		function insertElementAt(parentElement, element, index) {
			parentElement.insertBefore(element, parentElement.children[index]);
		}
		function removeElement(element) {
			if (element.parentElement) {
				element.parentElement.removeChild(element);
			}
		}
		function removeChildElements(element) {
			while (element.children.length > 0) {
				element.removeChild(element.children[0]);
			}
		}
		function removeChildNodes(element) {
			while (element.childNodes.length > 0) {
				element.removeChild(element.childNodes[0]);
			}
		}
		function findNextTarget(ev) {
			if (ev.relatedTarget) {
				return forceCast(ev.relatedTarget);
			}
			if ('explicitOriginalTarget' in ev) {
				return ev.explicitOriginalTarget;
			}
			return null;
		}

		const className$o = ClassName('lbl');
		function createLabelNode(doc, label) {
			const frag = doc.createDocumentFragment();
			const lineNodes = label.split('\n').map((line) => {
				return doc.createTextNode(line);
			});
			lineNodes.forEach((lineNode, index) => {
				if (index > 0) {
					frag.appendChild(doc.createElement('br'));
				}
				frag.appendChild(lineNode);
			});
			return frag;
		}
		class LabelView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$o());
				config.viewProps.bindClassModifiers(this.element);
				const labelElem = doc.createElement('div');
				labelElem.classList.add(className$o('l'));
				bindValueMap(config.props, 'label', (value) => {
					if (isEmpty(value)) {
						this.element.classList.add(className$o(undefined, 'nol'));
					} else {
						this.element.classList.remove(className$o(undefined, 'nol'));
						removeChildNodes(labelElem);
						labelElem.appendChild(createLabelNode(doc, value));
					}
				});
				this.element.appendChild(labelElem);
				this.labelElement = labelElem;
				const valueElem = doc.createElement('div');
				valueElem.classList.add(className$o('v'));
				this.element.appendChild(valueElem);
				this.valueElement = valueElem;
			}
		}

		class LabelController extends BladeController {
			constructor(doc, config) {
				const viewProps = config.valueController.viewProps;
				super(
					Object.assign(Object.assign({}, config), {
						view: new LabelView(doc, {
							props: config.props,
							viewProps: viewProps
						}),
						viewProps: viewProps
					})
				);
				this.props = config.props;
				this.valueController = config.valueController;
				this.view.valueElement.appendChild(this.valueController.view.element);
			}
		}

		const ButtonBladePlugin = {
			id: 'button',
			type: 'blade',
			accept(params) {
				const p = ParamsParsers;
				const result = parseParams(params, {
					title: p.required.string,
					view: p.required.constant('button'),
					label: p.optional.string
				});
				return result ? { params: result } : null;
			},
			controller(args) {
				return new LabelController(args.document, {
					blade: args.blade,
					props: ValueMap.fromObject({
						label: args.params.label
					}),
					valueController: new ButtonController(args.document, {
						props: ValueMap.fromObject({
							title: args.params.title
						}),
						viewProps: args.viewProps
					})
				});
			},
			api(args) {
				if (!(args.controller instanceof LabelController)) {
					return null;
				}
				if (!(args.controller.valueController instanceof ButtonController)) {
					return null;
				}
				return new ButtonApi(args.controller);
			}
		};

		class ValueBladeController extends BladeController {
			constructor(config) {
				super(config);
				this.value = config.value;
			}
		}

		function createBlade() {
			return new ValueMap({
				positions: createValue([], {
					equals: deepEqualsArray
				})
			});
		}

		class Foldable extends ValueMap {
			constructor(valueMap) {
				super(valueMap);
			}
			static create(expanded) {
				const coreObj = {
					completed: true,
					expanded: expanded,
					expandedHeight: null,
					shouldFixHeight: false,
					temporaryExpanded: null
				};
				const core = ValueMap.createCore(coreObj);
				return new Foldable(core);
			}
			get styleExpanded() {
				var _a;
				return (_a = this.get('temporaryExpanded')) !== null && _a !== void 0
					? _a
					: this.get('expanded');
			}
			get styleHeight() {
				if (!this.styleExpanded) {
					return '0';
				}
				const exHeight = this.get('expandedHeight');
				if (this.get('shouldFixHeight') && !isEmpty(exHeight)) {
					return `${exHeight}px`;
				}
				return 'auto';
			}
			bindExpandedClass(elem, expandedClassName) {
				bindValueMap(this, 'expanded', () => {
					const expanded = this.styleExpanded;
					if (expanded) {
						elem.classList.add(expandedClassName);
					} else {
						elem.classList.remove(expandedClassName);
					}
				});
			}
		}
		function computeExpandedFolderHeight(folder, containerElement) {
			let height = 0;
			disableTransitionTemporarily(containerElement, () => {
				folder.set('expandedHeight', null);
				folder.set('temporaryExpanded', true);
				forceReflow(containerElement);
				height = containerElement.clientHeight;
				folder.set('temporaryExpanded', null);
				forceReflow(containerElement);
			});
			return height;
		}
		function applyHeight(foldable, elem) {
			elem.style.height = foldable.styleHeight;
		}
		function bindFoldable(foldable, elem) {
			foldable.value('expanded').emitter.on('beforechange', () => {
				foldable.set('completed', false);
				if (isEmpty(foldable.get('expandedHeight'))) {
					foldable.set('expandedHeight', computeExpandedFolderHeight(foldable, elem));
				}
				foldable.set('shouldFixHeight', true);
				forceReflow(elem);
			});
			foldable.emitter.on('change', () => {
				applyHeight(foldable, elem);
			});
			applyHeight(foldable, elem);
			elem.addEventListener('transitionend', (ev) => {
				if (ev.propertyName !== 'height') {
					return;
				}
				foldable.set('shouldFixHeight', false);
				foldable.set('expandedHeight', null);
				foldable.set('completed', true);
			});
		}

		class RackLikeApi extends BladeApi {
			constructor(controller, rackApi) {
				super(controller);
				this.rackApi_ = rackApi;
			}
		}

		function addButtonAsBlade(api, params) {
			return api.addBlade(Object.assign(Object.assign({}, params), { view: 'button' }));
		}
		function addFolderAsBlade(api, params) {
			return api.addBlade(Object.assign(Object.assign({}, params), { view: 'folder' }));
		}
		function addSeparatorAsBlade(api, opt_params) {
			const params = opt_params || {};
			return api.addBlade(Object.assign(Object.assign({}, params), { view: 'separator' }));
		}
		function addTabAsBlade(api, params) {
			return api.addBlade(Object.assign(Object.assign({}, params), { view: 'tab' }));
		}

		class NestedOrderedSet {
			constructor(extract) {
				this.emitter = new Emitter();
				this.items_ = [];
				this.cache_ = new Set();
				this.onSubListAdd_ = this.onSubListAdd_.bind(this);
				this.onSubListRemove_ = this.onSubListRemove_.bind(this);
				this.extract_ = extract;
			}
			get items() {
				return this.items_;
			}
			allItems() {
				return Array.from(this.cache_);
			}
			find(callback) {
				for (const item of this.allItems()) {
					if (callback(item)) {
						return item;
					}
				}
				return null;
			}
			includes(item) {
				return this.cache_.has(item);
			}
			add(item, opt_index) {
				if (this.includes(item)) {
					throw TpError.shouldNeverHappen();
				}
				const index = opt_index !== undefined ? opt_index : this.items_.length;
				this.items_.splice(index, 0, item);
				this.cache_.add(item);
				const subList = this.extract_(item);
				if (subList) {
					subList.emitter.on('add', this.onSubListAdd_);
					subList.emitter.on('remove', this.onSubListRemove_);
					subList.allItems().forEach((item) => {
						this.cache_.add(item);
					});
				}
				this.emitter.emit('add', {
					index: index,
					item: item,
					root: this,
					target: this
				});
			}
			remove(item) {
				const index = this.items_.indexOf(item);
				if (index < 0) {
					return;
				}
				this.items_.splice(index, 1);
				this.cache_.delete(item);
				const subList = this.extract_(item);
				if (subList) {
					subList.emitter.off('add', this.onSubListAdd_);
					subList.emitter.off('remove', this.onSubListRemove_);
				}
				this.emitter.emit('remove', {
					index: index,
					item: item,
					root: this,
					target: this
				});
			}
			onSubListAdd_(ev) {
				this.cache_.add(ev.item);
				this.emitter.emit('add', {
					index: ev.index,
					item: ev.item,
					root: this,
					target: ev.target
				});
			}
			onSubListRemove_(ev) {
				this.cache_.delete(ev.item);
				this.emitter.emit('remove', {
					index: ev.index,
					item: ev.item,
					root: this,
					target: ev.target
				});
			}
		}

		class InputBindingApi extends BladeApi {
			constructor(controller) {
				super(controller);
				this.onBindingChange_ = this.onBindingChange_.bind(this);
				this.emitter_ = new Emitter();
				this.controller_.binding.emitter.on('change', this.onBindingChange_);
			}
			get label() {
				return this.controller_.props.get('label');
			}
			set label(label) {
				this.controller_.props.set('label', label);
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
			refresh() {
				this.controller_.binding.read();
			}
			onBindingChange_(ev) {
				const value = ev.sender.target.read();
				this.emitter_.emit('change', {
					event: new TpChangeEvent(
						this,
						forceCast(value),
						this.controller_.binding.target.presetKey,
						ev.options.last
					)
				});
			}
		}

		class InputBindingController extends LabelController {
			constructor(doc, config) {
				super(doc, config);
				this.binding = config.binding;
			}
		}

		class MonitorBindingApi extends BladeApi {
			constructor(controller) {
				super(controller);
				this.onBindingUpdate_ = this.onBindingUpdate_.bind(this);
				this.emitter_ = new Emitter();
				this.controller_.binding.emitter.on('update', this.onBindingUpdate_);
			}
			get label() {
				return this.controller_.props.get('label');
			}
			set label(label) {
				this.controller_.props.set('label', label);
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
			refresh() {
				this.controller_.binding.read();
			}
			onBindingUpdate_(ev) {
				const value = ev.sender.target.read();
				this.emitter_.emit('update', {
					event: new TpUpdateEvent(
						this,
						forceCast(value),
						this.controller_.binding.target.presetKey
					)
				});
			}
		}

		class MonitorBindingController extends LabelController {
			constructor(doc, config) {
				super(doc, config);
				this.binding = config.binding;
				this.viewProps.bindDisabled(this.binding.ticker);
				this.viewProps.handleDispose(() => {
					this.binding.dispose();
				});
			}
		}

		function findSubBladeApiSet(api) {
			if (api instanceof RackApi) {
				return api['apiSet_'];
			}
			if (api instanceof RackLikeApi) {
				return api['rackApi_']['apiSet_'];
			}
			return null;
		}
		function getApiByController(apiSet, controller) {
			const api = apiSet.find((api) => api.controller_ === controller);
			if (!api) {
				throw TpError.shouldNeverHappen();
			}
			return api;
		}
		function createBindingTarget(obj, key, opt_id) {
			if (!BindingTarget.isBindable(obj)) {
				throw TpError.notBindable();
			}
			return new BindingTarget(obj, key, opt_id);
		}
		class RackApi extends BladeApi {
			constructor(controller, pool) {
				super(controller);
				this.onRackAdd_ = this.onRackAdd_.bind(this);
				this.onRackRemove_ = this.onRackRemove_.bind(this);
				this.onRackInputChange_ = this.onRackInputChange_.bind(this);
				this.onRackMonitorUpdate_ = this.onRackMonitorUpdate_.bind(this);
				this.emitter_ = new Emitter();
				this.apiSet_ = new NestedOrderedSet(findSubBladeApiSet);
				this.pool_ = pool;
				const rack = this.controller_.rack;
				rack.emitter.on('add', this.onRackAdd_);
				rack.emitter.on('remove', this.onRackRemove_);
				rack.emitter.on('inputchange', this.onRackInputChange_);
				rack.emitter.on('monitorupdate', this.onRackMonitorUpdate_);
				rack.children.forEach((bc) => {
					this.setUpApi_(bc);
				});
			}
			get children() {
				return this.controller_.rack.children.map((bc) => getApiByController(this.apiSet_, bc));
			}
			addInput(object, key, opt_params) {
				const params = opt_params || {};
				const doc = this.controller_.view.element.ownerDocument;
				const bc = this.pool_.createInput(
					doc,
					createBindingTarget(object, key, params.presetKey),
					params
				);
				const api = new InputBindingApi(bc);
				return this.add(api, params.index);
			}
			addMonitor(object, key, opt_params) {
				const params = opt_params || {};
				const doc = this.controller_.view.element.ownerDocument;
				const bc = this.pool_.createMonitor(doc, createBindingTarget(object, key), params);
				const api = new MonitorBindingApi(bc);
				return forceCast(this.add(api, params.index));
			}
			addFolder(params) {
				return addFolderAsBlade(this, params);
			}
			addButton(params) {
				return addButtonAsBlade(this, params);
			}
			addSeparator(opt_params) {
				return addSeparatorAsBlade(this, opt_params);
			}
			addTab(params) {
				return addTabAsBlade(this, params);
			}
			add(api, opt_index) {
				this.controller_.rack.add(api.controller_, opt_index);
				const gapi = this.apiSet_.find((a) => a.controller_ === api.controller_);
				if (gapi) {
					this.apiSet_.remove(gapi);
				}
				this.apiSet_.add(api);
				return api;
			}
			remove(api) {
				this.controller_.rack.remove(api.controller_);
			}
			addBlade(params) {
				const doc = this.controller_.view.element.ownerDocument;
				const bc = this.pool_.createBlade(doc, params);
				const api = this.pool_.createBladeApi(bc);
				return this.add(api, params.index);
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
			setUpApi_(bc) {
				const api = this.apiSet_.find((api) => api.controller_ === bc);
				if (!api) {
					this.apiSet_.add(this.pool_.createBladeApi(bc));
				}
			}
			onRackAdd_(ev) {
				this.setUpApi_(ev.bladeController);
			}
			onRackRemove_(ev) {
				if (ev.isRoot) {
					const api = getApiByController(this.apiSet_, ev.bladeController);
					this.apiSet_.remove(api);
				}
			}
			onRackInputChange_(ev) {
				const bc = ev.bladeController;
				if (bc instanceof InputBindingController) {
					const api = getApiByController(this.apiSet_, bc);
					const binding = bc.binding;
					this.emitter_.emit('change', {
						event: new TpChangeEvent(
							api,
							forceCast(binding.target.read()),
							binding.target.presetKey,
							ev.options.last
						)
					});
				} else if (bc instanceof ValueBladeController) {
					const api = getApiByController(this.apiSet_, bc);
					this.emitter_.emit('change', {
						event: new TpChangeEvent(api, bc.value.rawValue, undefined, ev.options.last)
					});
				}
			}
			onRackMonitorUpdate_(ev) {
				if (!(ev.bladeController instanceof MonitorBindingController)) {
					throw TpError.shouldNeverHappen();
				}
				const api = getApiByController(this.apiSet_, ev.bladeController);
				const binding = ev.bladeController.binding;
				this.emitter_.emit('update', {
					event: new TpUpdateEvent(api, forceCast(binding.target.read()), binding.target.presetKey)
				});
			}
		}

		class FolderApi extends RackLikeApi {
			constructor(controller, pool) {
				super(controller, new RackApi(controller.rackController, pool));
				this.emitter_ = new Emitter();
				this.controller_.foldable.value('expanded').emitter.on('change', (ev) => {
					this.emitter_.emit('fold', {
						event: new TpFoldEvent(this, ev.sender.rawValue)
					});
				});
				this.rackApi_.on('change', (ev) => {
					this.emitter_.emit('change', {
						event: ev
					});
				});
				this.rackApi_.on('update', (ev) => {
					this.emitter_.emit('update', {
						event: ev
					});
				});
			}
			get expanded() {
				return this.controller_.foldable.get('expanded');
			}
			set expanded(expanded) {
				this.controller_.foldable.set('expanded', expanded);
			}
			get title() {
				return this.controller_.props.get('title');
			}
			set title(title) {
				this.controller_.props.set('title', title);
			}
			get children() {
				return this.rackApi_.children;
			}
			addInput(object, key, opt_params) {
				return this.rackApi_.addInput(object, key, opt_params);
			}
			addMonitor(object, key, opt_params) {
				return this.rackApi_.addMonitor(object, key, opt_params);
			}
			addFolder(params) {
				return this.rackApi_.addFolder(params);
			}
			addButton(params) {
				return this.rackApi_.addButton(params);
			}
			addSeparator(opt_params) {
				return this.rackApi_.addSeparator(opt_params);
			}
			addTab(params) {
				return this.rackApi_.addTab(params);
			}
			add(api, opt_index) {
				return this.rackApi_.add(api, opt_index);
			}
			remove(api) {
				this.rackApi_.remove(api);
			}
			addBlade(params) {
				return this.rackApi_.addBlade(params);
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
		}

		class RackLikeController extends BladeController {
			constructor(config) {
				super({
					blade: config.blade,
					view: config.view,
					viewProps: config.rackController.viewProps
				});
				this.rackController = config.rackController;
			}
		}

		class PlainView {
			constructor(doc, config) {
				const className = ClassName(config.viewName);
				this.element = doc.createElement('div');
				this.element.classList.add(className());
				config.viewProps.bindClassModifiers(this.element);
			}
		}

		function findInputBindingController(bcs, b) {
			for (let i = 0; i < bcs.length; i++) {
				const bc = bcs[i];
				if (bc instanceof InputBindingController && bc.binding === b) {
					return bc;
				}
			}
			return null;
		}
		function findMonitorBindingController(bcs, b) {
			for (let i = 0; i < bcs.length; i++) {
				const bc = bcs[i];
				if (bc instanceof MonitorBindingController && bc.binding === b) {
					return bc;
				}
			}
			return null;
		}
		function findValueBladeController(bcs, v) {
			for (let i = 0; i < bcs.length; i++) {
				const bc = bcs[i];
				if (bc instanceof ValueBladeController && bc.value === v) {
					return bc;
				}
			}
			return null;
		}
		function findSubRack(bc) {
			if (bc instanceof RackController) {
				return bc.rack;
			}
			if (bc instanceof RackLikeController) {
				return bc.rackController.rack;
			}
			return null;
		}
		function findSubBladeControllerSet(bc) {
			const rack = findSubRack(bc);
			return rack ? rack['bcSet_'] : null;
		}
		class BladeRack {
			constructor(blade) {
				var _a;
				this.onBladePositionsChange_ = this.onBladePositionsChange_.bind(this);
				this.onSetAdd_ = this.onSetAdd_.bind(this);
				this.onSetRemove_ = this.onSetRemove_.bind(this);
				this.onChildDispose_ = this.onChildDispose_.bind(this);
				this.onChildPositionsChange_ = this.onChildPositionsChange_.bind(this);
				this.onChildInputChange_ = this.onChildInputChange_.bind(this);
				this.onChildMonitorUpdate_ = this.onChildMonitorUpdate_.bind(this);
				this.onChildValueChange_ = this.onChildValueChange_.bind(this);
				this.onChildViewPropsChange_ = this.onChildViewPropsChange_.bind(this);
				this.onDescendantLayout_ = this.onDescendantLayout_.bind(this);
				this.onDescendantInputChange_ = this.onDescendantInputChange_.bind(this);
				this.onDescendantMonitorUpdate_ = this.onDescendantMonitorUpdate_.bind(this);
				this.emitter = new Emitter();
				this.blade_ = blade !== null && blade !== void 0 ? blade : null;
				(_a = this.blade_) === null || _a === void 0
					? void 0
					: _a.value('positions').emitter.on('change', this.onBladePositionsChange_);
				this.bcSet_ = new NestedOrderedSet(findSubBladeControllerSet);
				this.bcSet_.emitter.on('add', this.onSetAdd_);
				this.bcSet_.emitter.on('remove', this.onSetRemove_);
			}
			get children() {
				return this.bcSet_.items;
			}
			add(bc, opt_index) {
				if (bc.parent) {
					bc.parent.remove(bc);
				}
				bc['parent_'] = this;
				this.bcSet_.add(bc, opt_index);
			}
			remove(bc) {
				bc['parent_'] = null;
				this.bcSet_.remove(bc);
			}
			find(controllerClass) {
				return forceCast(
					this.bcSet_.allItems().filter((bc) => {
						return bc instanceof controllerClass;
					})
				);
			}
			onSetAdd_(ev) {
				this.updatePositions_();
				const isRoot = ev.target === ev.root;
				this.emitter.emit('add', {
					bladeController: ev.item,
					index: ev.index,
					isRoot: isRoot,
					sender: this
				});
				if (!isRoot) {
					return;
				}
				const bc = ev.item;
				bc.viewProps.emitter.on('change', this.onChildViewPropsChange_);
				bc.blade.value('positions').emitter.on('change', this.onChildPositionsChange_);
				bc.viewProps.handleDispose(this.onChildDispose_);
				if (bc instanceof InputBindingController) {
					bc.binding.emitter.on('change', this.onChildInputChange_);
				} else if (bc instanceof MonitorBindingController) {
					bc.binding.emitter.on('update', this.onChildMonitorUpdate_);
				} else if (bc instanceof ValueBladeController) {
					bc.value.emitter.on('change', this.onChildValueChange_);
				} else {
					const rack = findSubRack(bc);
					if (rack) {
						const emitter = rack.emitter;
						emitter.on('layout', this.onDescendantLayout_);
						emitter.on('inputchange', this.onDescendantInputChange_);
						emitter.on('monitorupdate', this.onDescendantMonitorUpdate_);
					}
				}
			}
			onSetRemove_(ev) {
				this.updatePositions_();
				const isRoot = ev.target === ev.root;
				this.emitter.emit('remove', {
					bladeController: ev.item,
					isRoot: isRoot,
					sender: this
				});
				if (!isRoot) {
					return;
				}
				const bc = ev.item;
				if (bc instanceof InputBindingController) {
					bc.binding.emitter.off('change', this.onChildInputChange_);
				} else if (bc instanceof MonitorBindingController) {
					bc.binding.emitter.off('update', this.onChildMonitorUpdate_);
				} else if (bc instanceof ValueBladeController) {
					bc.value.emitter.off('change', this.onChildValueChange_);
				} else {
					const rack = findSubRack(bc);
					if (rack) {
						const emitter = rack.emitter;
						emitter.off('layout', this.onDescendantLayout_);
						emitter.off('inputchange', this.onDescendantInputChange_);
						emitter.off('monitorupdate', this.onDescendantMonitorUpdate_);
					}
				}
			}
			updatePositions_() {
				const visibleItems = this.bcSet_.items.filter((bc) => !bc.viewProps.get('hidden'));
				const firstVisibleItem = visibleItems[0];
				const lastVisibleItem = visibleItems[visibleItems.length - 1];
				this.bcSet_.items.forEach((bc) => {
					const ps = [];
					if (bc === firstVisibleItem) {
						ps.push('first');
						if (!this.blade_ || this.blade_.get('positions').includes('veryfirst')) {
							ps.push('veryfirst');
						}
					}
					if (bc === lastVisibleItem) {
						ps.push('last');
						if (!this.blade_ || this.blade_.get('positions').includes('verylast')) {
							ps.push('verylast');
						}
					}
					bc.blade.set('positions', ps);
				});
			}
			onChildPositionsChange_() {
				this.updatePositions_();
				this.emitter.emit('layout', {
					sender: this
				});
			}
			onChildViewPropsChange_(_ev) {
				this.updatePositions_();
				this.emitter.emit('layout', {
					sender: this
				});
			}
			onChildDispose_() {
				const disposedUcs = this.bcSet_.items.filter((bc) => {
					return bc.viewProps.get('disposed');
				});
				disposedUcs.forEach((bc) => {
					this.bcSet_.remove(bc);
				});
			}
			onChildInputChange_(ev) {
				const bc = findInputBindingController(this.find(InputBindingController), ev.sender);
				if (!bc) {
					throw TpError.shouldNeverHappen();
				}
				this.emitter.emit('inputchange', {
					bladeController: bc,
					options: ev.options,
					sender: this
				});
			}
			onChildMonitorUpdate_(ev) {
				const bc = findMonitorBindingController(this.find(MonitorBindingController), ev.sender);
				if (!bc) {
					throw TpError.shouldNeverHappen();
				}
				this.emitter.emit('monitorupdate', {
					bladeController: bc,
					sender: this
				});
			}
			onChildValueChange_(ev) {
				const bc = findValueBladeController(this.find(ValueBladeController), ev.sender);
				if (!bc) {
					throw TpError.shouldNeverHappen();
				}
				this.emitter.emit('inputchange', {
					bladeController: bc,
					options: ev.options,
					sender: this
				});
			}
			onDescendantLayout_(_) {
				this.updatePositions_();
				this.emitter.emit('layout', {
					sender: this
				});
			}
			onDescendantInputChange_(ev) {
				this.emitter.emit('inputchange', {
					bladeController: ev.bladeController,
					options: ev.options,
					sender: this
				});
			}
			onDescendantMonitorUpdate_(ev) {
				this.emitter.emit('monitorupdate', {
					bladeController: ev.bladeController,
					sender: this
				});
			}
			onBladePositionsChange_() {
				this.updatePositions_();
			}
		}

		class RackController extends BladeController {
			constructor(doc, config) {
				super(
					Object.assign(Object.assign({}, config), {
						view: new PlainView(doc, {
							viewName: 'brk',
							viewProps: config.viewProps
						})
					})
				);
				this.onRackAdd_ = this.onRackAdd_.bind(this);
				this.onRackRemove_ = this.onRackRemove_.bind(this);
				const rack = new BladeRack(config.root ? undefined : config.blade);
				rack.emitter.on('add', this.onRackAdd_);
				rack.emitter.on('remove', this.onRackRemove_);
				this.rack = rack;
				this.viewProps.handleDispose(() => {
					for (let i = this.rack.children.length - 1; i >= 0; i--) {
						const bc = this.rack.children[i];
						bc.viewProps.set('disposed', true);
					}
				});
			}
			onRackAdd_(ev) {
				if (!ev.isRoot) {
					return;
				}
				insertElementAt(this.view.element, ev.bladeController.view.element, ev.index);
			}
			onRackRemove_(ev) {
				if (!ev.isRoot) {
					return;
				}
				removeElement(ev.bladeController.view.element);
			}
		}

		const bladeContainerClassName = ClassName('cnt');

		class FolderView {
			constructor(doc, config) {
				this.className_ = ClassName(config.viewName || 'fld');
				this.element = doc.createElement('div');
				this.element.classList.add(this.className_(), bladeContainerClassName());
				config.viewProps.bindClassModifiers(this.element);
				this.foldable_ = config.foldable;
				this.foldable_.bindExpandedClass(this.element, this.className_(undefined, 'expanded'));
				bindValueMap(
					this.foldable_,
					'completed',
					valueToClassName(this.element, this.className_(undefined, 'cpl'))
				);
				const buttonElem = doc.createElement('button');
				buttonElem.classList.add(this.className_('b'));
				bindValueMap(config.props, 'title', (title) => {
					if (isEmpty(title)) {
						this.element.classList.add(this.className_(undefined, 'not'));
					} else {
						this.element.classList.remove(this.className_(undefined, 'not'));
					}
				});
				config.viewProps.bindDisabled(buttonElem);
				this.element.appendChild(buttonElem);
				this.buttonElement = buttonElem;
				const titleElem = doc.createElement('div');
				titleElem.classList.add(this.className_('t'));
				bindValueToTextContent(config.props.value('title'), titleElem);
				this.buttonElement.appendChild(titleElem);
				this.titleElement = titleElem;
				const markElem = doc.createElement('div');
				markElem.classList.add(this.className_('m'));
				this.buttonElement.appendChild(markElem);
				const containerElem = config.containerElement;
				containerElem.classList.add(this.className_('c'));
				this.element.appendChild(containerElem);
				this.containerElement = containerElem;
			}
		}

		class FolderController extends RackLikeController {
			constructor(doc, config) {
				var _a;
				const foldable = Foldable.create(
					(_a = config.expanded) !== null && _a !== void 0 ? _a : true
				);
				const rc = new RackController(doc, {
					blade: config.blade,
					root: config.root,
					viewProps: config.viewProps
				});
				super(
					Object.assign(Object.assign({}, config), {
						rackController: rc,
						view: new FolderView(doc, {
							containerElement: rc.view.element,
							foldable: foldable,
							props: config.props,
							viewName: config.root ? 'rot' : undefined,
							viewProps: config.viewProps
						})
					})
				);
				this.onTitleClick_ = this.onTitleClick_.bind(this);
				this.props = config.props;
				this.foldable = foldable;
				bindFoldable(this.foldable, this.view.containerElement);
				this.view.buttonElement.addEventListener('click', this.onTitleClick_);
			}
			get document() {
				return this.view.element.ownerDocument;
			}
			onTitleClick_() {
				this.foldable.set('expanded', !this.foldable.get('expanded'));
			}
		}

		const FolderBladePlugin = {
			id: 'folder',
			type: 'blade',
			accept(params) {
				const p = ParamsParsers;
				const result = parseParams(params, {
					title: p.required.string,
					view: p.required.constant('folder'),
					expanded: p.optional.boolean
				});
				return result ? { params: result } : null;
			},
			controller(args) {
				return new FolderController(args.document, {
					blade: args.blade,
					expanded: args.params.expanded,
					props: ValueMap.fromObject({
						title: args.params.title
					}),
					viewProps: args.viewProps
				});
			},
			api(args) {
				if (!(args.controller instanceof FolderController)) {
					return null;
				}
				return new FolderApi(args.controller, args.pool);
			}
		};

		class LabeledValueController extends ValueBladeController {
			constructor(doc, config) {
				const viewProps = config.valueController.viewProps;
				super(
					Object.assign(Object.assign({}, config), {
						value: config.valueController.value,
						view: new LabelView(doc, {
							props: config.props,
							viewProps: viewProps
						}),
						viewProps: viewProps
					})
				);
				this.props = config.props;
				this.valueController = config.valueController;
				this.view.valueElement.appendChild(this.valueController.view.element);
			}
		}

		class SeparatorApi extends BladeApi {}

		const className$n = ClassName('spr');
		class SeparatorView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$n());
				config.viewProps.bindClassModifiers(this.element);
				const hrElem = doc.createElement('hr');
				hrElem.classList.add(className$n('r'));
				this.element.appendChild(hrElem);
			}
		}

		class SeparatorController extends BladeController {
			constructor(doc, config) {
				super(
					Object.assign(Object.assign({}, config), {
						view: new SeparatorView(doc, {
							viewProps: config.viewProps
						})
					})
				);
			}
		}

		const SeparatorBladePlugin = {
			id: 'separator',
			type: 'blade',
			accept(params) {
				const p = ParamsParsers;
				const result = parseParams(params, {
					view: p.required.constant('separator')
				});
				return result ? { params: result } : null;
			},
			controller(args) {
				return new SeparatorController(args.document, {
					blade: args.blade,
					viewProps: args.viewProps
				});
			},
			api(args) {
				if (!(args.controller instanceof SeparatorController)) {
					return null;
				}
				return new SeparatorApi(args.controller);
			}
		};

		const className$m = ClassName('');
		function valueToModifier(elem, modifier) {
			return valueToClassName(elem, className$m(undefined, modifier));
		}
		class ViewProps extends ValueMap {
			constructor(valueMap) {
				super(valueMap);
			}
			static create(opt_initialValue) {
				var _a, _b;
				const initialValue =
					opt_initialValue !== null && opt_initialValue !== void 0 ? opt_initialValue : {};
				const coreObj = {
					disabled: (_a = initialValue.disabled) !== null && _a !== void 0 ? _a : false,
					disposed: false,
					hidden: (_b = initialValue.hidden) !== null && _b !== void 0 ? _b : false
				};
				const core = ValueMap.createCore(coreObj);
				return new ViewProps(core);
			}
			bindClassModifiers(elem) {
				bindValueMap(this, 'disabled', valueToModifier(elem, 'disabled'));
				bindValueMap(this, 'hidden', valueToModifier(elem, 'hidden'));
			}
			bindDisabled(target) {
				bindValueMap(this, 'disabled', (disabled) => {
					target.disabled = disabled;
				});
			}
			bindTabIndex(elem) {
				bindValueMap(this, 'disabled', (disabled) => {
					elem.tabIndex = disabled ? -1 : 0;
				});
			}
			handleDispose(callback) {
				this.value('disposed').emitter.on('change', (disposed) => {
					if (disposed) {
						callback();
					}
				});
			}
		}

		const className$l = ClassName('tbi');
		class TabItemView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$l());
				config.viewProps.bindClassModifiers(this.element);
				bindValueMap(config.props, 'selected', (selected) => {
					if (selected) {
						this.element.classList.add(className$l(undefined, 'sel'));
					} else {
						this.element.classList.remove(className$l(undefined, 'sel'));
					}
				});
				const buttonElem = doc.createElement('button');
				buttonElem.classList.add(className$l('b'));
				config.viewProps.bindDisabled(buttonElem);
				this.element.appendChild(buttonElem);
				this.buttonElement = buttonElem;
				const titleElem = doc.createElement('div');
				titleElem.classList.add(className$l('t'));
				bindValueToTextContent(config.props.value('title'), titleElem);
				this.buttonElement.appendChild(titleElem);
				this.titleElement = titleElem;
			}
		}

		class TabItemController {
			constructor(doc, config) {
				this.emitter = new Emitter();
				this.onClick_ = this.onClick_.bind(this);
				this.props = config.props;
				this.viewProps = config.viewProps;
				this.view = new TabItemView(doc, {
					props: config.props,
					viewProps: config.viewProps
				});
				this.view.buttonElement.addEventListener('click', this.onClick_);
			}
			onClick_() {
				this.emitter.emit('click', {
					sender: this
				});
			}
		}

		class TabPageController {
			constructor(doc, config) {
				this.onItemClick_ = this.onItemClick_.bind(this);
				this.ic_ = new TabItemController(doc, {
					props: config.itemProps,
					viewProps: ViewProps.create()
				});
				this.ic_.emitter.on('click', this.onItemClick_);
				this.cc_ = new RackController(doc, {
					blade: createBlade(),
					viewProps: ViewProps.create()
				});
				this.props = config.props;
				bindValueMap(this.props, 'selected', (selected) => {
					this.itemController.props.set('selected', selected);
					this.contentController.viewProps.set('hidden', !selected);
				});
			}
			get itemController() {
				return this.ic_;
			}
			get contentController() {
				return this.cc_;
			}
			onItemClick_() {
				this.props.set('selected', true);
			}
		}

		class TabPageApi {
			constructor(controller, contentRackApi) {
				this.controller_ = controller;
				this.rackApi_ = contentRackApi;
			}
			get title() {
				var _a;
				return (_a = this.controller_.itemController.props.get('title')) !== null && _a !== void 0
					? _a
					: '';
			}
			set title(title) {
				this.controller_.itemController.props.set('title', title);
			}
			get selected() {
				return this.controller_.props.get('selected');
			}
			set selected(selected) {
				this.controller_.props.set('selected', selected);
			}
			get children() {
				return this.rackApi_.children;
			}
			addButton(params) {
				return this.rackApi_.addButton(params);
			}
			addFolder(params) {
				return this.rackApi_.addFolder(params);
			}
			addSeparator(opt_params) {
				return this.rackApi_.addSeparator(opt_params);
			}
			addTab(params) {
				return this.rackApi_.addTab(params);
			}
			add(api, opt_index) {
				this.rackApi_.add(api, opt_index);
			}
			remove(api) {
				this.rackApi_.remove(api);
			}
			addInput(object, key, opt_params) {
				return this.rackApi_.addInput(object, key, opt_params);
			}
			addMonitor(object, key, opt_params) {
				return this.rackApi_.addMonitor(object, key, opt_params);
			}
			addBlade(params) {
				return this.rackApi_.addBlade(params);
			}
		}

		class TabApi extends RackLikeApi {
			constructor(controller, pool) {
				super(controller, new RackApi(controller.rackController, pool));
				this.onPageAdd_ = this.onPageAdd_.bind(this);
				this.onPageRemove_ = this.onPageRemove_.bind(this);
				this.emitter_ = new Emitter();
				this.pageApiMap_ = new Map();
				this.rackApi_.on('change', (ev) => {
					this.emitter_.emit('change', {
						event: ev
					});
				});
				this.rackApi_.on('update', (ev) => {
					this.emitter_.emit('update', {
						event: ev
					});
				});
				this.controller_.pageSet.emitter.on('add', this.onPageAdd_);
				this.controller_.pageSet.emitter.on('remove', this.onPageRemove_);
				this.controller_.pageSet.items.forEach((pc) => {
					this.setUpPageApi_(pc);
				});
			}
			get pages() {
				return this.controller_.pageSet.items.map((pc) => {
					const api = this.pageApiMap_.get(pc);
					if (!api) {
						throw TpError.shouldNeverHappen();
					}
					return api;
				});
			}
			addPage(params) {
				const doc = this.controller_.view.element.ownerDocument;
				const pc = new TabPageController(doc, {
					itemProps: ValueMap.fromObject({
						selected: false,
						title: params.title
					}),
					props: ValueMap.fromObject({
						selected: false
					})
				});
				this.controller_.add(pc, params.index);
				const api = this.pageApiMap_.get(pc);
				if (!api) {
					throw TpError.shouldNeverHappen();
				}
				return api;
			}
			removePage(index) {
				this.controller_.remove(index);
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
			setUpPageApi_(pc) {
				const rackApi = this.rackApi_['apiSet_'].find(
					(api) => api.controller_ === pc.contentController
				);
				if (!rackApi) {
					throw TpError.shouldNeverHappen();
				}
				const api = new TabPageApi(pc, rackApi);
				this.pageApiMap_.set(pc, api);
			}
			onPageAdd_(ev) {
				this.setUpPageApi_(ev.item);
			}
			onPageRemove_(ev) {
				const api = this.pageApiMap_.get(ev.item);
				if (!api) {
					throw TpError.shouldNeverHappen();
				}
				this.pageApiMap_.delete(ev.item);
			}
		}

		const className$k = ClassName('tab');
		class TabView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$k(), bladeContainerClassName());
				config.viewProps.bindClassModifiers(this.element);
				bindValue(config.empty, valueToClassName(this.element, className$k(undefined, 'nop')));
				const itemsElem = doc.createElement('div');
				itemsElem.classList.add(className$k('i'));
				this.element.appendChild(itemsElem);
				this.itemsElement = itemsElem;
				const contentsElem = config.contentsElement;
				contentsElem.classList.add(className$k('c'));
				this.element.appendChild(contentsElem);
				this.contentsElement = contentsElem;
			}
		}

		class TabController extends RackLikeController {
			constructor(doc, config) {
				const cr = new RackController(doc, {
					blade: config.blade,
					viewProps: config.viewProps
				});
				const empty = createValue(true);
				super({
					blade: config.blade,
					rackController: cr,
					view: new TabView(doc, {
						contentsElement: cr.view.element,
						empty: empty,
						viewProps: config.viewProps
					})
				});
				this.onPageAdd_ = this.onPageAdd_.bind(this);
				this.onPageRemove_ = this.onPageRemove_.bind(this);
				this.onPageSelectedChange_ = this.onPageSelectedChange_.bind(this);
				this.pageSet_ = new NestedOrderedSet(() => null);
				this.pageSet_.emitter.on('add', this.onPageAdd_);
				this.pageSet_.emitter.on('remove', this.onPageRemove_);
				this.empty_ = empty;
				this.applyPages_();
			}
			get pageSet() {
				return this.pageSet_;
			}
			add(pc, opt_index) {
				this.pageSet_.add(
					pc,
					opt_index !== null && opt_index !== void 0 ? opt_index : this.pageSet_.items.length
				);
			}
			remove(index) {
				this.pageSet_.remove(this.pageSet_.items[index]);
			}
			applyPages_() {
				this.keepSelection_();
				this.empty_.rawValue = this.pageSet_.items.length === 0;
			}
			onPageAdd_(ev) {
				const pc = ev.item;
				insertElementAt(this.view.itemsElement, pc.itemController.view.element, ev.index);
				this.rackController.rack.add(pc.contentController, ev.index);
				pc.props.value('selected').emitter.on('change', this.onPageSelectedChange_);
				this.applyPages_();
			}
			onPageRemove_(ev) {
				const pc = ev.item;
				removeElement(pc.itemController.view.element);
				this.rackController.rack.remove(pc.contentController);
				pc.props.value('selected').emitter.off('change', this.onPageSelectedChange_);
				this.applyPages_();
			}
			keepSelection_() {
				if (this.pageSet_.items.length === 0) {
					return;
				}
				const firstSelIndex = this.pageSet_.items.findIndex((pc) => pc.props.get('selected'));
				if (firstSelIndex < 0) {
					this.pageSet_.items.forEach((pc, i) => {
						pc.props.set('selected', i === 0);
					});
				} else {
					this.pageSet_.items.forEach((pc, i) => {
						pc.props.set('selected', i === firstSelIndex);
					});
				}
			}
			onPageSelectedChange_(ev) {
				if (ev.rawValue) {
					const index = this.pageSet_.items.findIndex(
						(pc) => pc.props.value('selected') === ev.sender
					);
					this.pageSet_.items.forEach((pc, i) => {
						pc.props.set('selected', i === index);
					});
				} else {
					this.keepSelection_();
				}
			}
		}

		const TabBladePlugin = {
			id: 'tab',
			type: 'blade',
			accept(params) {
				const p = ParamsParsers;
				const result = parseParams(params, {
					pages: p.required.array(p.required.object({ title: p.required.string })),
					view: p.required.constant('tab')
				});
				if (!result || result.pages.length === 0) {
					return null;
				}
				return { params: result };
			},
			controller(args) {
				const c = new TabController(args.document, {
					blade: args.blade,
					viewProps: args.viewProps
				});
				args.params.pages.forEach((p) => {
					const pc = new TabPageController(args.document, {
						itemProps: ValueMap.fromObject({
							selected: false,
							title: p.title
						}),
						props: ValueMap.fromObject({
							selected: false
						})
					});
					c.add(pc);
				});
				return c;
			},
			api(args) {
				if (!(args.controller instanceof TabController)) {
					return null;
				}
				return new TabApi(args.controller, args.pool);
			}
		};

		function createBladeController(plugin, args) {
			const ac = plugin.accept(args.params);
			if (!ac) {
				return null;
			}
			const disabled = ParamsParsers.optional.boolean(args.params['disabled']).value;
			const hidden = ParamsParsers.optional.boolean(args.params['hidden']).value;
			return plugin.controller({
				blade: createBlade(),
				document: args.document,
				params: forceCast(
					Object.assign(Object.assign({}, ac.params), { disabled: disabled, hidden: hidden })
				),
				viewProps: ViewProps.create({
					disabled: disabled,
					hidden: hidden
				})
			});
		}

		class ManualTicker {
			constructor() {
				this.disabled = false;
				this.emitter = new Emitter();
			}
			dispose() {}
			tick() {
				if (this.disabled) {
					return;
				}
				this.emitter.emit('tick', {
					sender: this
				});
			}
		}

		class IntervalTicker {
			constructor(doc, interval) {
				this.disabled_ = false;
				this.timerId_ = null;
				this.onTick_ = this.onTick_.bind(this);
				this.doc_ = doc;
				this.emitter = new Emitter();
				this.interval_ = interval;
				this.setTimer_();
			}
			get disabled() {
				return this.disabled_;
			}
			set disabled(inactive) {
				this.disabled_ = inactive;
				if (this.disabled_) {
					this.clearTimer_();
				} else {
					this.setTimer_();
				}
			}
			dispose() {
				this.clearTimer_();
			}
			clearTimer_() {
				if (this.timerId_ === null) {
					return;
				}
				const win = this.doc_.defaultView;
				if (win) {
					win.clearInterval(this.timerId_);
				}
				this.timerId_ = null;
			}
			setTimer_() {
				this.clearTimer_();
				if (this.interval_ <= 0) {
					return;
				}
				const win = this.doc_.defaultView;
				if (win) {
					this.timerId_ = win.setInterval(this.onTick_, this.interval_);
				}
			}
			onTick_() {
				if (this.disabled_) {
					return;
				}
				this.emitter.emit('tick', {
					sender: this
				});
			}
		}

		class CompositeConstraint {
			constructor(constraints) {
				this.constraints = constraints;
			}
			constrain(value) {
				return this.constraints.reduce((result, c) => {
					return c.constrain(result);
				}, value);
			}
		}
		function findConstraint(c, constraintClass) {
			if (c instanceof constraintClass) {
				return c;
			}
			if (c instanceof CompositeConstraint) {
				const result = c.constraints.reduce((tmpResult, sc) => {
					if (tmpResult) {
						return tmpResult;
					}
					return sc instanceof constraintClass ? sc : null;
				}, null);
				if (result) {
					return result;
				}
			}
			return null;
		}

		class ListConstraint {
			constructor(options) {
				this.options = options;
			}
			constrain(value) {
				const opts = this.options;
				if (opts.length === 0) {
					return value;
				}
				const matched =
					opts.filter((item) => {
						return item.value === value;
					}).length > 0;
				return matched ? value : opts[0].value;
			}
		}

		class RangeConstraint {
			constructor(config) {
				this.maxValue = config.max;
				this.minValue = config.min;
			}
			constrain(value) {
				let result = value;
				if (!isEmpty(this.minValue)) {
					result = Math.max(result, this.minValue);
				}
				if (!isEmpty(this.maxValue)) {
					result = Math.min(result, this.maxValue);
				}
				return result;
			}
		}

		class StepConstraint {
			constructor(step) {
				this.step = step;
			}
			constrain(value) {
				const r = value < 0 ? -Math.round(-value / this.step) : Math.round(value / this.step);
				return r * this.step;
			}
		}

		const className$j = ClassName('lst');
		class ListView {
			constructor(doc, config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.props_ = config.props;
				this.element = doc.createElement('div');
				this.element.classList.add(className$j());
				config.viewProps.bindClassModifiers(this.element);
				const selectElem = doc.createElement('select');
				selectElem.classList.add(className$j('s'));
				bindValueMap(this.props_, 'options', (opts) => {
					removeChildElements(selectElem);
					opts.forEach((item, index) => {
						const optionElem = doc.createElement('option');
						optionElem.dataset.index = String(index);
						optionElem.textContent = item.text;
						optionElem.value = String(item.value);
						selectElem.appendChild(optionElem);
					});
				});
				config.viewProps.bindDisabled(selectElem);
				this.element.appendChild(selectElem);
				this.selectElement = selectElem;
				const markElem = doc.createElement('div');
				markElem.classList.add(className$j('m'));
				markElem.appendChild(createSvgIconElement(doc, 'dropdown'));
				this.element.appendChild(markElem);
				config.value.emitter.on('change', this.onValueChange_);
				this.value_ = config.value;
				this.update_();
			}
			update_() {
				this.selectElement.value = String(this.value_.rawValue);
			}
			onValueChange_() {
				this.update_();
			}
		}

		class ListController {
			constructor(doc, config) {
				this.onSelectChange_ = this.onSelectChange_.bind(this);
				this.props = config.props;
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new ListView(doc, {
					props: this.props,
					value: this.value,
					viewProps: this.viewProps
				});
				this.view.selectElement.addEventListener('change', this.onSelectChange_);
			}
			onSelectChange_(e) {
				const selectElem = forceCast(e.currentTarget);
				const optElem = selectElem.selectedOptions.item(0);
				if (!optElem) {
					return;
				}
				const itemIndex = Number(optElem.dataset.index);
				this.value.rawValue = this.props.get('options')[itemIndex].value;
			}
		}

		const className$i = ClassName('pop');
		class PopupView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$i());
				config.viewProps.bindClassModifiers(this.element);
				bindValue(config.shows, valueToClassName(this.element, className$i(undefined, 'v')));
			}
		}

		class PopupController {
			constructor(doc, config) {
				this.shows = createValue(false);
				this.viewProps = config.viewProps;
				this.view = new PopupView(doc, {
					shows: this.shows,
					viewProps: this.viewProps
				});
			}
		}

		const className$h = ClassName('txt');
		class TextView {
			constructor(doc, config) {
				this.onChange_ = this.onChange_.bind(this);
				this.element = doc.createElement('div');
				this.element.classList.add(className$h());
				config.viewProps.bindClassModifiers(this.element);
				this.props_ = config.props;
				this.props_.emitter.on('change', this.onChange_);
				const inputElem = doc.createElement('input');
				inputElem.classList.add(className$h('i'));
				inputElem.type = 'text';
				config.viewProps.bindDisabled(inputElem);
				this.element.appendChild(inputElem);
				this.inputElement = inputElem;
				config.value.emitter.on('change', this.onChange_);
				this.value_ = config.value;
				this.refresh();
			}
			refresh() {
				const formatter = this.props_.get('formatter');
				this.inputElement.value = formatter(this.value_.rawValue);
			}
			onChange_() {
				this.refresh();
			}
		}

		class TextController {
			constructor(doc, config) {
				this.onInputChange_ = this.onInputChange_.bind(this);
				this.parser_ = config.parser;
				this.props = config.props;
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new TextView(doc, {
					props: config.props,
					value: this.value,
					viewProps: this.viewProps
				});
				this.view.inputElement.addEventListener('change', this.onInputChange_);
			}
			onInputChange_(e) {
				const inputElem = forceCast(e.currentTarget);
				const value = inputElem.value;
				const parsedValue = this.parser_(value);
				if (!isEmpty(parsedValue)) {
					this.value.rawValue = parsedValue;
				}
				this.view.refresh();
			}
		}

		function boolToString(value) {
			return String(value);
		}
		function boolFromUnknown(value) {
			if (value === 'false') {
				return false;
			}
			return !!value;
		}
		function BooleanFormatter(value) {
			return boolToString(value);
		}

		class NumberLiteralNode {
			constructor(text) {
				this.text = text;
			}
			evaluate() {
				return Number(this.text);
			}
			toString() {
				return this.text;
			}
		}
		const BINARY_OPERATION_MAP = {
			'**': (v1, v2) => Math.pow(v1, v2),
			'*': (v1, v2) => v1 * v2,
			'/': (v1, v2) => v1 / v2,
			'%': (v1, v2) => v1 % v2,
			'+': (v1, v2) => v1 + v2,
			'-': (v1, v2) => v1 - v2,
			'<<': (v1, v2) => v1 << v2,
			'>>': (v1, v2) => v1 >> v2,
			'>>>': (v1, v2) => v1 >>> v2,
			'&': (v1, v2) => v1 & v2,
			'^': (v1, v2) => v1 ^ v2,
			'|': (v1, v2) => v1 | v2
		};
		class BinaryOperationNode {
			constructor(operator, left, right) {
				this.left = left;
				this.operator = operator;
				this.right = right;
			}
			evaluate() {
				const op = BINARY_OPERATION_MAP[this.operator];
				if (!op) {
					throw new Error(`unexpected binary operator: '${this.operator}`);
				}
				return op(this.left.evaluate(), this.right.evaluate());
			}
			toString() {
				return ['b(', this.left.toString(), this.operator, this.right.toString(), ')'].join(' ');
			}
		}
		const UNARY_OPERATION_MAP = {
			'+': (v) => v,
			'-': (v) => -v,
			'~': (v) => ~v
		};
		class UnaryOperationNode {
			constructor(operator, expr) {
				this.operator = operator;
				this.expression = expr;
			}
			evaluate() {
				const op = UNARY_OPERATION_MAP[this.operator];
				if (!op) {
					throw new Error(`unexpected unary operator: '${this.operator}`);
				}
				return op(this.expression.evaluate());
			}
			toString() {
				return ['u(', this.operator, this.expression.toString(), ')'].join(' ');
			}
		}

		function combineReader(parsers) {
			return (text, cursor) => {
				for (let i = 0; i < parsers.length; i++) {
					const result = parsers[i](text, cursor);
					if (result !== '') {
						return result;
					}
				}
				return '';
			};
		}
		function readWhitespace(text, cursor) {
			var _a;
			const m = text.substr(cursor).match(/^\s+/);
			return (_a = m && m[0]) !== null && _a !== void 0 ? _a : '';
		}
		function readNonZeroDigit(text, cursor) {
			const ch = text.substr(cursor, 1);
			return ch.match(/^[1-9]$/) ? ch : '';
		}
		function readDecimalDigits(text, cursor) {
			var _a;
			const m = text.substr(cursor).match(/^[0-9]+/);
			return (_a = m && m[0]) !== null && _a !== void 0 ? _a : '';
		}
		function readSignedInteger(text, cursor) {
			const ds = readDecimalDigits(text, cursor);
			if (ds !== '') {
				return ds;
			}
			const sign = text.substr(cursor, 1);
			cursor += 1;
			if (sign !== '-' && sign !== '+') {
				return '';
			}
			const sds = readDecimalDigits(text, cursor);
			if (sds === '') {
				return '';
			}
			return sign + sds;
		}
		function readExponentPart(text, cursor) {
			const e = text.substr(cursor, 1);
			cursor += 1;
			if (e.toLowerCase() !== 'e') {
				return '';
			}
			const si = readSignedInteger(text, cursor);
			if (si === '') {
				return '';
			}
			return e + si;
		}
		function readDecimalIntegerLiteral(text, cursor) {
			const ch = text.substr(cursor, 1);
			if (ch === '0') {
				return ch;
			}
			const nzd = readNonZeroDigit(text, cursor);
			cursor += nzd.length;
			if (nzd === '') {
				return '';
			}
			return nzd + readDecimalDigits(text, cursor);
		}
		function readDecimalLiteral1(text, cursor) {
			const dil = readDecimalIntegerLiteral(text, cursor);
			cursor += dil.length;
			if (dil === '') {
				return '';
			}
			const dot = text.substr(cursor, 1);
			cursor += dot.length;
			if (dot !== '.') {
				return '';
			}
			const dds = readDecimalDigits(text, cursor);
			cursor += dds.length;
			return dil + dot + dds + readExponentPart(text, cursor);
		}
		function readDecimalLiteral2(text, cursor) {
			const dot = text.substr(cursor, 1);
			cursor += dot.length;
			if (dot !== '.') {
				return '';
			}
			const dds = readDecimalDigits(text, cursor);
			cursor += dds.length;
			if (dds === '') {
				return '';
			}
			return dot + dds + readExponentPart(text, cursor);
		}
		function readDecimalLiteral3(text, cursor) {
			const dil = readDecimalIntegerLiteral(text, cursor);
			cursor += dil.length;
			if (dil === '') {
				return '';
			}
			return dil + readExponentPart(text, cursor);
		}
		const readDecimalLiteral = combineReader([
			readDecimalLiteral1,
			readDecimalLiteral2,
			readDecimalLiteral3
		]);
		function parseBinaryDigits(text, cursor) {
			var _a;
			const m = text.substr(cursor).match(/^[01]+/);
			return (_a = m && m[0]) !== null && _a !== void 0 ? _a : '';
		}
		function readBinaryIntegerLiteral(text, cursor) {
			const prefix = text.substr(cursor, 2);
			cursor += prefix.length;
			if (prefix.toLowerCase() !== '0b') {
				return '';
			}
			const bds = parseBinaryDigits(text, cursor);
			if (bds === '') {
				return '';
			}
			return prefix + bds;
		}
		function readOctalDigits(text, cursor) {
			var _a;
			const m = text.substr(cursor).match(/^[0-7]+/);
			return (_a = m && m[0]) !== null && _a !== void 0 ? _a : '';
		}
		function readOctalIntegerLiteral(text, cursor) {
			const prefix = text.substr(cursor, 2);
			cursor += prefix.length;
			if (prefix.toLowerCase() !== '0o') {
				return '';
			}
			const ods = readOctalDigits(text, cursor);
			if (ods === '') {
				return '';
			}
			return prefix + ods;
		}
		function readHexDigits(text, cursor) {
			var _a;
			const m = text.substr(cursor).match(/^[0-9a-f]+/i);
			return (_a = m && m[0]) !== null && _a !== void 0 ? _a : '';
		}
		function readHexIntegerLiteral(text, cursor) {
			const prefix = text.substr(cursor, 2);
			cursor += prefix.length;
			if (prefix.toLowerCase() !== '0x') {
				return '';
			}
			const hds = readHexDigits(text, cursor);
			if (hds === '') {
				return '';
			}
			return prefix + hds;
		}
		const readNonDecimalIntegerLiteral = combineReader([
			readBinaryIntegerLiteral,
			readOctalIntegerLiteral,
			readHexIntegerLiteral
		]);
		const readNumericLiteral = combineReader([readNonDecimalIntegerLiteral, readDecimalLiteral]);

		function parseLiteral(text, cursor) {
			const num = readNumericLiteral(text, cursor);
			cursor += num.length;
			if (num === '') {
				return null;
			}
			return {
				evaluable: new NumberLiteralNode(num),
				cursor: cursor
			};
		}
		function parseParenthesizedExpression(text, cursor) {
			const op = text.substr(cursor, 1);
			cursor += op.length;
			if (op !== '(') {
				return null;
			}
			const expr = parseExpression(text, cursor);
			if (!expr) {
				return null;
			}
			cursor = expr.cursor;
			cursor += readWhitespace(text, cursor).length;
			const cl = text.substr(cursor, 1);
			cursor += cl.length;
			if (cl !== ')') {
				return null;
			}
			return {
				evaluable: expr.evaluable,
				cursor: cursor
			};
		}
		function parsePrimaryExpression(text, cursor) {
			return parseLiteral(text, cursor) || parseParenthesizedExpression(text, cursor);
		}
		function parseUnaryExpression(text, cursor) {
			const expr = parsePrimaryExpression(text, cursor);
			if (expr) {
				return expr;
			}
			const op = text.substr(cursor, 1);
			cursor += op.length;
			if (op !== '+' && op !== '-' && op !== '~') {
				return null;
			}
			const num = parseUnaryExpression(text, cursor);
			if (!num) {
				return null;
			}
			cursor = num.cursor;
			return {
				cursor: cursor,
				evaluable: new UnaryOperationNode(op, num.evaluable)
			};
		}
		function readBinaryOperator(ops, text, cursor) {
			cursor += readWhitespace(text, cursor).length;
			const op = ops.filter((op) => text.startsWith(op, cursor))[0];
			if (!op) {
				return null;
			}
			cursor += op.length;
			cursor += readWhitespace(text, cursor).length;
			return {
				cursor: cursor,
				operator: op
			};
		}
		function createBinaryOperationExpressionParser(exprParser, ops) {
			return (text, cursor) => {
				const firstExpr = exprParser(text, cursor);
				if (!firstExpr) {
					return null;
				}
				cursor = firstExpr.cursor;
				let expr = firstExpr.evaluable;
				for (;;) {
					const op = readBinaryOperator(ops, text, cursor);
					if (!op) {
						break;
					}
					cursor = op.cursor;
					const nextExpr = exprParser(text, cursor);
					if (!nextExpr) {
						return null;
					}
					cursor = nextExpr.cursor;
					expr = new BinaryOperationNode(op.operator, expr, nextExpr.evaluable);
				}
				return expr
					? {
							cursor: cursor,
							evaluable: expr
					  }
					: null;
			};
		}
		const parseBinaryOperationExpression = [
			['**'],
			['*', '/', '%'],
			['+', '-'],
			['<<', '>>>', '>>'],
			['&'],
			['^'],
			['|']
		].reduce((parser, ops) => {
			return createBinaryOperationExpressionParser(parser, ops);
		}, parseUnaryExpression);
		function parseExpression(text, cursor) {
			cursor += readWhitespace(text, cursor).length;
			return parseBinaryOperationExpression(text, cursor);
		}
		function parseEcmaNumberExpression(text) {
			const expr = parseExpression(text, 0);
			if (!expr) {
				return null;
			}
			const cursor = expr.cursor + readWhitespace(text, expr.cursor).length;
			if (cursor !== text.length) {
				return null;
			}
			return expr.evaluable;
		}

		function parseNumber(text) {
			var _a;
			const r = parseEcmaNumberExpression(text);
			return (_a = r === null || r === void 0 ? void 0 : r.evaluate()) !== null && _a !== void 0
				? _a
				: null;
		}
		function numberFromUnknown(value) {
			if (typeof value === 'number') {
				return value;
			}
			if (typeof value === 'string') {
				const pv = parseNumber(value);
				if (!isEmpty(pv)) {
					return pv;
				}
			}
			return 0;
		}
		function numberToString(value) {
			return String(value);
		}
		function createNumberFormatter(digits) {
			return (value) => {
				return value.toFixed(Math.max(Math.min(digits, 20), 0));
			};
		}

		const innerFormatter = createNumberFormatter(0);
		function formatPercentage(value) {
			return innerFormatter(value) + '%';
		}

		function stringFromUnknown(value) {
			return String(value);
		}
		function formatString(value) {
			return value;
		}

		function fillBuffer(buffer, bufferSize) {
			while (buffer.length < bufferSize) {
				buffer.push(undefined);
			}
		}
		function initializeBuffer(bufferSize) {
			const buffer = [];
			fillBuffer(buffer, bufferSize);
			return createValue(buffer);
		}
		function createTrimmedBuffer(buffer) {
			const index = buffer.indexOf(undefined);
			return forceCast(index < 0 ? buffer : buffer.slice(0, index));
		}
		function createPushedBuffer(buffer, newValue) {
			const newBuffer = [...createTrimmedBuffer(buffer), newValue];
			if (newBuffer.length > buffer.length) {
				newBuffer.splice(0, newBuffer.length - buffer.length);
			} else {
				fillBuffer(newBuffer, buffer.length);
			}
			return newBuffer;
		}

		function connectValues({ primary, secondary, forward, backward }) {
			let changing = false;
			function preventFeedback(callback) {
				if (changing) {
					return;
				}
				changing = true;
				callback();
				changing = false;
			}
			primary.emitter.on('change', (ev) => {
				preventFeedback(() => {
					secondary.setRawValue(forward(primary, secondary), ev.options);
				});
			});
			secondary.emitter.on('change', (ev) => {
				preventFeedback(() => {
					primary.setRawValue(backward(primary, secondary), ev.options);
				});
				preventFeedback(() => {
					secondary.setRawValue(forward(primary, secondary), ev.options);
				});
			});
			preventFeedback(() => {
				secondary.setRawValue(forward(primary, secondary), {
					forceEmit: false,
					last: true
				});
			});
		}

		function getStepForKey(baseStep, keys) {
			const step = baseStep * (keys.altKey ? 0.1 : 1) * (keys.shiftKey ? 10 : 1);
			if (keys.upKey) {
				return +step;
			} else if (keys.downKey) {
				return -step;
			}
			return 0;
		}
		function getVerticalStepKeys(ev) {
			return {
				altKey: ev.altKey,
				downKey: ev.key === 'ArrowDown',
				shiftKey: ev.shiftKey,
				upKey: ev.key === 'ArrowUp'
			};
		}
		function getHorizontalStepKeys(ev) {
			return {
				altKey: ev.altKey,
				downKey: ev.key === 'ArrowLeft',
				shiftKey: ev.shiftKey,
				upKey: ev.key === 'ArrowRight'
			};
		}
		function isVerticalArrowKey(key) {
			return key === 'ArrowUp' || key === 'ArrowDown';
		}
		function isArrowKey(key) {
			return isVerticalArrowKey(key) || key === 'ArrowLeft' || key === 'ArrowRight';
		}

		function computeOffset$1(ev, elem) {
			const win = elem.ownerDocument.defaultView;
			const rect = elem.getBoundingClientRect();
			return {
				x: ev.pageX - (((win && win.scrollX) || 0) + rect.left),
				y: ev.pageY - (((win && win.scrollY) || 0) + rect.top)
			};
		}
		class PointerHandler {
			constructor(element) {
				this.lastTouch_ = null;
				this.onDocumentMouseMove_ = this.onDocumentMouseMove_.bind(this);
				this.onDocumentMouseUp_ = this.onDocumentMouseUp_.bind(this);
				this.onMouseDown_ = this.onMouseDown_.bind(this);
				this.onTouchEnd_ = this.onTouchEnd_.bind(this);
				this.onTouchMove_ = this.onTouchMove_.bind(this);
				this.onTouchStart_ = this.onTouchStart_.bind(this);
				this.elem_ = element;
				this.emitter = new Emitter();
				element.addEventListener('touchstart', this.onTouchStart_, {
					passive: false
				});
				element.addEventListener('touchmove', this.onTouchMove_, {
					passive: true
				});
				element.addEventListener('touchend', this.onTouchEnd_);
				element.addEventListener('mousedown', this.onMouseDown_);
			}
			computePosition_(offset) {
				const rect = this.elem_.getBoundingClientRect();
				return {
					bounds: {
						width: rect.width,
						height: rect.height
					},
					point: offset
						? {
								x: offset.x,
								y: offset.y
						  }
						: null
				};
			}
			onMouseDown_(ev) {
				var _a;
				ev.preventDefault();
				(_a = ev.currentTarget) === null || _a === void 0 ? void 0 : _a.focus();
				const doc = this.elem_.ownerDocument;
				doc.addEventListener('mousemove', this.onDocumentMouseMove_);
				doc.addEventListener('mouseup', this.onDocumentMouseUp_);
				this.emitter.emit('down', {
					altKey: ev.altKey,
					data: this.computePosition_(computeOffset$1(ev, this.elem_)),
					sender: this,
					shiftKey: ev.shiftKey
				});
			}
			onDocumentMouseMove_(ev) {
				this.emitter.emit('move', {
					altKey: ev.altKey,
					data: this.computePosition_(computeOffset$1(ev, this.elem_)),
					sender: this,
					shiftKey: ev.shiftKey
				});
			}
			onDocumentMouseUp_(ev) {
				const doc = this.elem_.ownerDocument;
				doc.removeEventListener('mousemove', this.onDocumentMouseMove_);
				doc.removeEventListener('mouseup', this.onDocumentMouseUp_);
				this.emitter.emit('up', {
					altKey: ev.altKey,
					data: this.computePosition_(computeOffset$1(ev, this.elem_)),
					sender: this,
					shiftKey: ev.shiftKey
				});
			}
			onTouchStart_(ev) {
				ev.preventDefault();
				const touch = ev.targetTouches.item(0);
				const rect = this.elem_.getBoundingClientRect();
				this.emitter.emit('down', {
					altKey: ev.altKey,
					data: this.computePosition_(
						touch
							? {
									x: touch.clientX - rect.left,
									y: touch.clientY - rect.top
							  }
							: undefined
					),
					sender: this,
					shiftKey: ev.shiftKey
				});
				this.lastTouch_ = touch;
			}
			onTouchMove_(ev) {
				const touch = ev.targetTouches.item(0);
				const rect = this.elem_.getBoundingClientRect();
				this.emitter.emit('move', {
					altKey: ev.altKey,
					data: this.computePosition_(
						touch
							? {
									x: touch.clientX - rect.left,
									y: touch.clientY - rect.top
							  }
							: undefined
					),
					sender: this,
					shiftKey: ev.shiftKey
				});
				this.lastTouch_ = touch;
			}
			onTouchEnd_(ev) {
				var _a;
				const touch =
					(_a = ev.targetTouches.item(0)) !== null && _a !== void 0 ? _a : this.lastTouch_;
				const rect = this.elem_.getBoundingClientRect();
				this.emitter.emit('up', {
					altKey: ev.altKey,
					data: this.computePosition_(
						touch
							? {
									x: touch.clientX - rect.left,
									y: touch.clientY - rect.top
							  }
							: undefined
					),
					sender: this,
					shiftKey: ev.shiftKey
				});
			}
		}

		function mapRange(value, start1, end1, start2, end2) {
			const p = (value - start1) / (end1 - start1);
			return start2 + p * (end2 - start2);
		}
		function getDecimalDigits(value) {
			const text = String(value.toFixed(10));
			const frac = text.split('.')[1];
			return frac.replace(/0+$/, '').length;
		}
		function constrainRange(value, min, max) {
			return Math.min(Math.max(value, min), max);
		}
		function loopRange(value, max) {
			return ((value % max) + max) % max;
		}

		const className$g = ClassName('txt');
		class NumberTextView {
			constructor(doc, config) {
				this.onChange_ = this.onChange_.bind(this);
				this.props_ = config.props;
				this.props_.emitter.on('change', this.onChange_);
				this.element = doc.createElement('div');
				this.element.classList.add(className$g(), className$g(undefined, 'num'));
				if (config.arrayPosition) {
					this.element.classList.add(className$g(undefined, config.arrayPosition));
				}
				config.viewProps.bindClassModifiers(this.element);
				const inputElem = doc.createElement('input');
				inputElem.classList.add(className$g('i'));
				inputElem.type = 'text';
				config.viewProps.bindDisabled(inputElem);
				this.element.appendChild(inputElem);
				this.inputElement = inputElem;
				this.onDraggingChange_ = this.onDraggingChange_.bind(this);
				this.dragging_ = config.dragging;
				this.dragging_.emitter.on('change', this.onDraggingChange_);
				this.element.classList.add(className$g());
				this.inputElement.classList.add(className$g('i'));
				const knobElem = doc.createElement('div');
				knobElem.classList.add(className$g('k'));
				this.element.appendChild(knobElem);
				this.knobElement = knobElem;
				const guideElem = doc.createElementNS(SVG_NS, 'svg');
				guideElem.classList.add(className$g('g'));
				this.knobElement.appendChild(guideElem);
				const bodyElem = doc.createElementNS(SVG_NS, 'path');
				bodyElem.classList.add(className$g('gb'));
				guideElem.appendChild(bodyElem);
				this.guideBodyElem_ = bodyElem;
				const headElem = doc.createElementNS(SVG_NS, 'path');
				headElem.classList.add(className$g('gh'));
				guideElem.appendChild(headElem);
				this.guideHeadElem_ = headElem;
				const tooltipElem = doc.createElement('div');
				tooltipElem.classList.add(ClassName('tt')());
				this.knobElement.appendChild(tooltipElem);
				this.tooltipElem_ = tooltipElem;
				config.value.emitter.on('change', this.onChange_);
				this.value = config.value;
				this.refresh();
			}
			onDraggingChange_(ev) {
				if (ev.rawValue === null) {
					this.element.classList.remove(className$g(undefined, 'drg'));
					return;
				}
				this.element.classList.add(className$g(undefined, 'drg'));
				const x = ev.rawValue / this.props_.get('draggingScale');
				const aox = x + (x > 0 ? -1 : x < 0 ? +1 : 0);
				const adx = constrainRange(-aox, -4, +4);
				this.guideHeadElem_.setAttributeNS(
					null,
					'd',
					[`M ${aox + adx},0 L${aox},4 L${aox + adx},8`, `M ${x},-1 L${x},9`].join(' ')
				);
				this.guideBodyElem_.setAttributeNS(null, 'd', `M 0,4 L${x},4`);
				const formatter = this.props_.get('formatter');
				this.tooltipElem_.textContent = formatter(this.value.rawValue);
				this.tooltipElem_.style.left = `${x}px`;
			}
			refresh() {
				const formatter = this.props_.get('formatter');
				this.inputElement.value = formatter(this.value.rawValue);
			}
			onChange_() {
				this.refresh();
			}
		}

		class NumberTextController {
			constructor(doc, config) {
				this.originRawValue_ = 0;
				this.onInputChange_ = this.onInputChange_.bind(this);
				this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
				this.onInputKeyUp_ = this.onInputKeyUp_.bind(this);
				this.onPointerDown_ = this.onPointerDown_.bind(this);
				this.onPointerMove_ = this.onPointerMove_.bind(this);
				this.onPointerUp_ = this.onPointerUp_.bind(this);
				this.baseStep_ = config.baseStep;
				this.parser_ = config.parser;
				this.props = config.props;
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.dragging_ = createValue(null);
				this.view = new NumberTextView(doc, {
					arrayPosition: config.arrayPosition,
					dragging: this.dragging_,
					props: this.props,
					value: this.value,
					viewProps: this.viewProps
				});
				this.view.inputElement.addEventListener('change', this.onInputChange_);
				this.view.inputElement.addEventListener('keydown', this.onInputKeyDown_);
				this.view.inputElement.addEventListener('keyup', this.onInputKeyUp_);
				const ph = new PointerHandler(this.view.knobElement);
				ph.emitter.on('down', this.onPointerDown_);
				ph.emitter.on('move', this.onPointerMove_);
				ph.emitter.on('up', this.onPointerUp_);
			}
			onInputChange_(e) {
				const inputElem = forceCast(e.currentTarget);
				const value = inputElem.value;
				const parsedValue = this.parser_(value);
				if (!isEmpty(parsedValue)) {
					this.value.rawValue = parsedValue;
				}
				this.view.refresh();
			}
			onInputKeyDown_(ev) {
				const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
				if (step === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue + step, {
					forceEmit: false,
					last: false
				});
			}
			onInputKeyUp_(ev) {
				const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
				if (step === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue, {
					forceEmit: true,
					last: true
				});
			}
			onPointerDown_() {
				this.originRawValue_ = this.value.rawValue;
				this.dragging_.rawValue = 0;
			}
			computeDraggingValue_(data) {
				if (!data.point) {
					return null;
				}
				const dx = data.point.x - data.bounds.width / 2;
				return this.originRawValue_ + dx * this.props.get('draggingScale');
			}
			onPointerMove_(ev) {
				const v = this.computeDraggingValue_(ev.data);
				if (v === null) {
					return;
				}
				this.value.setRawValue(v, {
					forceEmit: false,
					last: false
				});
				this.dragging_.rawValue = this.value.rawValue - this.originRawValue_;
			}
			onPointerUp_(ev) {
				const v = this.computeDraggingValue_(ev.data);
				if (v === null) {
					return;
				}
				this.value.setRawValue(v, {
					forceEmit: true,
					last: true
				});
				this.dragging_.rawValue = null;
			}
		}

		const className$f = ClassName('sld');
		class SliderView {
			constructor(doc, config) {
				this.onChange_ = this.onChange_.bind(this);
				this.props_ = config.props;
				this.props_.emitter.on('change', this.onChange_);
				this.element = doc.createElement('div');
				this.element.classList.add(className$f());
				config.viewProps.bindClassModifiers(this.element);
				const trackElem = doc.createElement('div');
				trackElem.classList.add(className$f('t'));
				config.viewProps.bindTabIndex(trackElem);
				this.element.appendChild(trackElem);
				this.trackElement = trackElem;
				const knobElem = doc.createElement('div');
				knobElem.classList.add(className$f('k'));
				this.trackElement.appendChild(knobElem);
				this.knobElement = knobElem;
				config.value.emitter.on('change', this.onChange_);
				this.value = config.value;
				this.update_();
			}
			update_() {
				const p = constrainRange(
					mapRange(
						this.value.rawValue,
						this.props_.get('minValue'),
						this.props_.get('maxValue'),
						0,
						100
					),
					0,
					100
				);
				this.knobElement.style.width = `${p}%`;
			}
			onChange_() {
				this.update_();
			}
		}

		class SliderController {
			constructor(doc, config) {
				this.onKeyDown_ = this.onKeyDown_.bind(this);
				this.onKeyUp_ = this.onKeyUp_.bind(this);
				this.onPointerDownOrMove_ = this.onPointerDownOrMove_.bind(this);
				this.onPointerUp_ = this.onPointerUp_.bind(this);
				this.baseStep_ = config.baseStep;
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.props = config.props;
				this.view = new SliderView(doc, {
					props: this.props,
					value: this.value,
					viewProps: this.viewProps
				});
				this.ptHandler_ = new PointerHandler(this.view.trackElement);
				this.ptHandler_.emitter.on('down', this.onPointerDownOrMove_);
				this.ptHandler_.emitter.on('move', this.onPointerDownOrMove_);
				this.ptHandler_.emitter.on('up', this.onPointerUp_);
				this.view.trackElement.addEventListener('keydown', this.onKeyDown_);
				this.view.trackElement.addEventListener('keyup', this.onKeyUp_);
			}
			handlePointerEvent_(d, opts) {
				if (!d.point) {
					return;
				}
				this.value.setRawValue(
					mapRange(
						constrainRange(d.point.x, 0, d.bounds.width),
						0,
						d.bounds.width,
						this.props.get('minValue'),
						this.props.get('maxValue')
					),
					opts
				);
			}
			onPointerDownOrMove_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerUp_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: true,
					last: true
				});
			}
			onKeyDown_(ev) {
				const step = getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
				if (step === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue + step, {
					forceEmit: false,
					last: false
				});
			}
			onKeyUp_(ev) {
				const step = getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
				if (step === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue, {
					forceEmit: true,
					last: true
				});
			}
		}

		const className$e = ClassName('sldtxt');
		class SliderTextView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$e());
				const sliderElem = doc.createElement('div');
				sliderElem.classList.add(className$e('s'));
				this.sliderView_ = config.sliderView;
				sliderElem.appendChild(this.sliderView_.element);
				this.element.appendChild(sliderElem);
				const textElem = doc.createElement('div');
				textElem.classList.add(className$e('t'));
				this.textView_ = config.textView;
				textElem.appendChild(this.textView_.element);
				this.element.appendChild(textElem);
			}
		}

		class SliderTextController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.sliderC_ = new SliderController(doc, {
					baseStep: config.baseStep,
					props: config.sliderProps,
					value: config.value,
					viewProps: this.viewProps
				});
				this.textC_ = new NumberTextController(doc, {
					baseStep: config.baseStep,
					parser: config.parser,
					props: config.textProps,
					value: config.value,
					viewProps: config.viewProps
				});
				this.view = new SliderTextView(doc, {
					sliderView: this.sliderC_.view,
					textView: this.textC_.view
				});
			}
			get sliderController() {
				return this.sliderC_;
			}
			get textController() {
				return this.textC_;
			}
		}

		function writePrimitive(target, value) {
			target.write(value);
		}

		function parseListOptions(value) {
			const p = ParamsParsers;
			if (Array.isArray(value)) {
				return p.required.array(
					p.required.object({
						text: p.required.string,
						value: p.required.raw
					})
				)(value).value;
			}
			if (typeof value === 'object') {
				return p.required.raw(value).value;
			}
			return undefined;
		}
		function parsePickerLayout(value) {
			if (value === 'inline' || value === 'popup') {
				return value;
			}
			return undefined;
		}
		function parsePointDimensionParams(value) {
			const p = ParamsParsers;
			return p.required.object({
				max: p.optional.number,
				min: p.optional.number,
				step: p.optional.number
			})(value).value;
		}
		function normalizeListOptions(options) {
			if (Array.isArray(options)) {
				return options;
			}
			const items = [];
			Object.keys(options).forEach((text) => {
				items.push({ text: text, value: options[text] });
			});
			return items;
		}
		function createListConstraint(options) {
			return !isEmpty(options)
				? new ListConstraint(normalizeListOptions(forceCast(options)))
				: null;
		}
		function findListItems(constraint) {
			const c = constraint ? findConstraint(constraint, ListConstraint) : null;
			if (!c) {
				return null;
			}
			return c.options;
		}
		function findStep(constraint) {
			const c = constraint ? findConstraint(constraint, StepConstraint) : null;
			if (!c) {
				return null;
			}
			return c.step;
		}
		function getSuitableDecimalDigits(constraint, rawValue) {
			const sc = constraint && findConstraint(constraint, StepConstraint);
			if (sc) {
				return getDecimalDigits(sc.step);
			}
			return Math.max(getDecimalDigits(rawValue), 2);
		}
		function getBaseStep(constraint) {
			const step = findStep(constraint);
			return step !== null && step !== void 0 ? step : 1;
		}
		function getSuitableDraggingScale(constraint, rawValue) {
			var _a;
			const sc = constraint && findConstraint(constraint, StepConstraint);
			const base = Math.abs(
				(_a = sc === null || sc === void 0 ? void 0 : sc.step) !== null && _a !== void 0
					? _a
					: rawValue
			);
			return base === 0 ? 0.1 : Math.pow(10, Math.floor(Math.log10(base)) - 1);
		}

		const className$d = ClassName('ckb');
		class CheckboxView {
			constructor(doc, config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.element = doc.createElement('div');
				this.element.classList.add(className$d());
				config.viewProps.bindClassModifiers(this.element);
				const labelElem = doc.createElement('label');
				labelElem.classList.add(className$d('l'));
				this.element.appendChild(labelElem);
				const inputElem = doc.createElement('input');
				inputElem.classList.add(className$d('i'));
				inputElem.type = 'checkbox';
				labelElem.appendChild(inputElem);
				this.inputElement = inputElem;
				config.viewProps.bindDisabled(this.inputElement);
				const wrapperElem = doc.createElement('div');
				wrapperElem.classList.add(className$d('w'));
				labelElem.appendChild(wrapperElem);
				const markElem = createSvgIconElement(doc, 'check');
				wrapperElem.appendChild(markElem);
				config.value.emitter.on('change', this.onValueChange_);
				this.value = config.value;
				this.update_();
			}
			update_() {
				this.inputElement.checked = this.value.rawValue;
			}
			onValueChange_() {
				this.update_();
			}
		}

		class CheckboxController {
			constructor(doc, config) {
				this.onInputChange_ = this.onInputChange_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new CheckboxView(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				this.view.inputElement.addEventListener('change', this.onInputChange_);
			}
			onInputChange_(e) {
				const inputElem = forceCast(e.currentTarget);
				this.value.rawValue = inputElem.checked;
			}
		}

		function createConstraint$5(params) {
			const constraints = [];
			const lc = createListConstraint(params.options);
			if (lc) {
				constraints.push(lc);
			}
			return new CompositeConstraint(constraints);
		}
		const BooleanInputPlugin = {
			id: 'input-bool',
			type: 'input',
			accept: (value, params) => {
				if (typeof value !== 'boolean') {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					options: p.optional.custom(parseListOptions)
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => boolFromUnknown,
				constraint: (args) => createConstraint$5(args.params),
				writer: (_args) => writePrimitive
			},
			controller: (args) => {
				var _a;
				const doc = args.document;
				const value = args.value;
				const c = args.constraint;
				if (c && findConstraint(c, ListConstraint)) {
					return new ListController(doc, {
						props: ValueMap.fromObject({
							options: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : []
						}),
						value: value,
						viewProps: args.viewProps
					});
				}
				return new CheckboxController(doc, {
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		const className$c = ClassName('col');
		class ColorView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$c());
				config.foldable.bindExpandedClass(this.element, className$c(undefined, 'expanded'));
				bindValueMap(
					config.foldable,
					'completed',
					valueToClassName(this.element, className$c(undefined, 'cpl'))
				);
				const headElem = doc.createElement('div');
				headElem.classList.add(className$c('h'));
				this.element.appendChild(headElem);
				const swatchElem = doc.createElement('div');
				swatchElem.classList.add(className$c('s'));
				headElem.appendChild(swatchElem);
				this.swatchElement = swatchElem;
				const textElem = doc.createElement('div');
				textElem.classList.add(className$c('t'));
				headElem.appendChild(textElem);
				this.textElement = textElem;
				if (config.pickerLayout === 'inline') {
					const pickerElem = doc.createElement('div');
					pickerElem.classList.add(className$c('p'));
					this.element.appendChild(pickerElem);
					this.pickerElement = pickerElem;
				} else {
					this.pickerElement = null;
				}
			}
		}

		function rgbToHsl(r, g, b) {
			const rp = constrainRange(r / 255, 0, 1);
			const gp = constrainRange(g / 255, 0, 1);
			const bp = constrainRange(b / 255, 0, 1);
			const cmax = Math.max(rp, gp, bp);
			const cmin = Math.min(rp, gp, bp);
			const c = cmax - cmin;
			let h = 0;
			let s = 0;
			const l = (cmin + cmax) / 2;
			if (c !== 0) {
				s = c / (1 - Math.abs(cmax + cmin - 1));
				if (rp === cmax) {
					h = (gp - bp) / c;
				} else if (gp === cmax) {
					h = 2 + (bp - rp) / c;
				} else {
					h = 4 + (rp - gp) / c;
				}
				h = h / 6 + (h < 0 ? 1 : 0);
			}
			return [h * 360, s * 100, l * 100];
		}
		function hslToRgb(h, s, l) {
			const hp = ((h % 360) + 360) % 360;
			const sp = constrainRange(s / 100, 0, 1);
			const lp = constrainRange(l / 100, 0, 1);
			const c = (1 - Math.abs(2 * lp - 1)) * sp;
			const x = c * (1 - Math.abs(((hp / 60) % 2) - 1));
			const m = lp - c / 2;
			let rp, gp, bp;
			if (hp >= 0 && hp < 60) {
				[rp, gp, bp] = [c, x, 0];
			} else if (hp >= 60 && hp < 120) {
				[rp, gp, bp] = [x, c, 0];
			} else if (hp >= 120 && hp < 180) {
				[rp, gp, bp] = [0, c, x];
			} else if (hp >= 180 && hp < 240) {
				[rp, gp, bp] = [0, x, c];
			} else if (hp >= 240 && hp < 300) {
				[rp, gp, bp] = [x, 0, c];
			} else {
				[rp, gp, bp] = [c, 0, x];
			}
			return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
		}
		function rgbToHsv(r, g, b) {
			const rp = constrainRange(r / 255, 0, 1);
			const gp = constrainRange(g / 255, 0, 1);
			const bp = constrainRange(b / 255, 0, 1);
			const cmax = Math.max(rp, gp, bp);
			const cmin = Math.min(rp, gp, bp);
			const d = cmax - cmin;
			let h;
			if (d === 0) {
				h = 0;
			} else if (cmax === rp) {
				h = 60 * (((((gp - bp) / d) % 6) + 6) % 6);
			} else if (cmax === gp) {
				h = 60 * ((bp - rp) / d + 2);
			} else {
				h = 60 * ((rp - gp) / d + 4);
			}
			const s = cmax === 0 ? 0 : d / cmax;
			const v = cmax;
			return [h, s * 100, v * 100];
		}
		function hsvToRgb(h, s, v) {
			const hp = loopRange(h, 360);
			const sp = constrainRange(s / 100, 0, 1);
			const vp = constrainRange(v / 100, 0, 1);
			const c = vp * sp;
			const x = c * (1 - Math.abs(((hp / 60) % 2) - 1));
			const m = vp - c;
			let rp, gp, bp;
			if (hp >= 0 && hp < 60) {
				[rp, gp, bp] = [c, x, 0];
			} else if (hp >= 60 && hp < 120) {
				[rp, gp, bp] = [x, c, 0];
			} else if (hp >= 120 && hp < 180) {
				[rp, gp, bp] = [0, c, x];
			} else if (hp >= 180 && hp < 240) {
				[rp, gp, bp] = [0, x, c];
			} else if (hp >= 240 && hp < 300) {
				[rp, gp, bp] = [x, 0, c];
			} else {
				[rp, gp, bp] = [c, 0, x];
			}
			return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
		}
		function hslToHsv(h, s, l) {
			const sd = l + (s * (100 - Math.abs(2 * l - 100))) / (2 * 100);
			return [
				h,
				sd !== 0 ? (s * (100 - Math.abs(2 * l - 100))) / sd : 0,
				l + (s * (100 - Math.abs(2 * l - 100))) / (2 * 100)
			];
		}
		function hsvToHsl(h, s, v) {
			const sd = 100 - Math.abs((v * (200 - s)) / 100 - 100);
			return [h, sd !== 0 ? (s * v) / sd : 0, (v * (200 - s)) / (2 * 100)];
		}
		function removeAlphaComponent(comps) {
			return [comps[0], comps[1], comps[2]];
		}
		function appendAlphaComponent(comps, alpha) {
			return [comps[0], comps[1], comps[2], alpha];
		}
		const MODE_CONVERTER_MAP = {
			hsl: {
				hsl: (h, s, l) => [h, s, l],
				hsv: hslToHsv,
				rgb: hslToRgb
			},
			hsv: {
				hsl: hsvToHsl,
				hsv: (h, s, v) => [h, s, v],
				rgb: hsvToRgb
			},
			rgb: {
				hsl: rgbToHsl,
				hsv: rgbToHsv,
				rgb: (r, g, b) => [r, g, b]
			}
		};
		function convertColorMode(components, fromMode, toMode) {
			return MODE_CONVERTER_MAP[fromMode][toMode](...components);
		}

		const CONSTRAINT_MAP = {
			hsl: (comps) => {
				var _a;
				return [
					loopRange(comps[0], 360),
					constrainRange(comps[1], 0, 100),
					constrainRange(comps[2], 0, 100),
					constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1)
				];
			},
			hsv: (comps) => {
				var _a;
				return [
					loopRange(comps[0], 360),
					constrainRange(comps[1], 0, 100),
					constrainRange(comps[2], 0, 100),
					constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1)
				];
			},
			rgb: (comps) => {
				var _a;
				return [
					constrainRange(comps[0], 0, 255),
					constrainRange(comps[1], 0, 255),
					constrainRange(comps[2], 0, 255),
					constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1)
				];
			}
		};
		function isRgbColorComponent(obj, key) {
			if (typeof obj !== 'object' || isEmpty(obj)) {
				return false;
			}
			return key in obj && typeof obj[key] === 'number';
		}
		class Color {
			constructor(comps, mode) {
				this.mode_ = mode;
				this.comps_ = CONSTRAINT_MAP[mode](comps);
			}
			static black() {
				return new Color([0, 0, 0], 'rgb');
			}
			static fromObject(obj) {
				const comps = 'a' in obj ? [obj.r, obj.g, obj.b, obj.a] : [obj.r, obj.g, obj.b];
				return new Color(comps, 'rgb');
			}
			static toRgbaObject(color) {
				return color.toRgbaObject();
			}
			static isRgbColorObject(obj) {
				return (
					isRgbColorComponent(obj, 'r') &&
					isRgbColorComponent(obj, 'g') &&
					isRgbColorComponent(obj, 'b')
				);
			}
			static isRgbaColorObject(obj) {
				return this.isRgbColorObject(obj) && isRgbColorComponent(obj, 'a');
			}
			static isColorObject(obj) {
				return this.isRgbColorObject(obj);
			}
			static equals(v1, v2) {
				if (v1.mode_ !== v2.mode_) {
					return false;
				}
				const comps1 = v1.comps_;
				const comps2 = v2.comps_;
				for (let i = 0; i < comps1.length; i++) {
					if (comps1[i] !== comps2[i]) {
						return false;
					}
				}
				return true;
			}
			get mode() {
				return this.mode_;
			}
			getComponents(opt_mode) {
				return appendAlphaComponent(
					convertColorMode(removeAlphaComponent(this.comps_), this.mode_, opt_mode || this.mode_),
					this.comps_[3]
				);
			}
			toRgbaObject() {
				const rgbComps = this.getComponents('rgb');
				return {
					r: rgbComps[0],
					g: rgbComps[1],
					b: rgbComps[2],
					a: rgbComps[3]
				};
			}
		}

		const className$b = ClassName('colp');
		class ColorPickerView {
			constructor(doc, config) {
				this.alphaViews_ = null;
				this.element = doc.createElement('div');
				this.element.classList.add(className$b());
				const hsvElem = doc.createElement('div');
				hsvElem.classList.add(className$b('hsv'));
				const svElem = doc.createElement('div');
				svElem.classList.add(className$b('sv'));
				this.svPaletteView_ = config.svPaletteView;
				svElem.appendChild(this.svPaletteView_.element);
				hsvElem.appendChild(svElem);
				const hElem = doc.createElement('div');
				hElem.classList.add(className$b('h'));
				this.hPaletteView_ = config.hPaletteView;
				hElem.appendChild(this.hPaletteView_.element);
				hsvElem.appendChild(hElem);
				this.element.appendChild(hsvElem);
				const rgbElem = doc.createElement('div');
				rgbElem.classList.add(className$b('rgb'));
				this.textView_ = config.textView;
				rgbElem.appendChild(this.textView_.element);
				this.element.appendChild(rgbElem);
				if (config.alphaViews) {
					this.alphaViews_ = {
						palette: config.alphaViews.palette,
						text: config.alphaViews.text
					};
					const aElem = doc.createElement('div');
					aElem.classList.add(className$b('a'));
					const apElem = doc.createElement('div');
					apElem.classList.add(className$b('ap'));
					apElem.appendChild(this.alphaViews_.palette.element);
					aElem.appendChild(apElem);
					const atElem = doc.createElement('div');
					atElem.classList.add(className$b('at'));
					atElem.appendChild(this.alphaViews_.text.element);
					aElem.appendChild(atElem);
					this.element.appendChild(aElem);
				}
			}
			get allFocusableElements() {
				const elems = [
					this.svPaletteView_.element,
					this.hPaletteView_.element,
					this.textView_.modeSelectElement,
					...this.textView_.textViews.map((v) => v.inputElement)
				];
				if (this.alphaViews_) {
					elems.push(this.alphaViews_.palette.element, this.alphaViews_.text.inputElement);
				}
				return elems;
			}
		}

		function parseColorInputParams(params) {
			const p = ParamsParsers;
			return parseParams(params, {
				alpha: p.optional.boolean,
				expanded: p.optional.boolean,
				picker: p.optional.custom(parsePickerLayout)
			});
		}
		function getBaseStepForColor(forAlpha) {
			return forAlpha ? 0.1 : 1;
		}

		function parseCssNumberOrPercentage(text, maxValue) {
			const m = text.match(/^(.+)%$/);
			if (!m) {
				return Math.min(parseFloat(text), maxValue);
			}
			return Math.min(parseFloat(m[1]) * 0.01 * maxValue, maxValue);
		}
		const ANGLE_TO_DEG_MAP = {
			deg: (angle) => angle,
			grad: (angle) => (angle * 360) / 400,
			rad: (angle) => (angle * 360) / (2 * Math.PI),
			turn: (angle) => angle * 360
		};
		function parseCssNumberOrAngle(text) {
			const m = text.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);
			if (!m) {
				return parseFloat(text);
			}
			const angle = parseFloat(m[1]);
			const unit = m[2];
			return ANGLE_TO_DEG_MAP[unit](angle);
		}
		const NOTATION_TO_PARSER_MAP = {
			'func.rgb': (text) => {
				const m = text.match(
					/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/
				);
				if (!m) {
					return null;
				}
				const comps = [
					parseCssNumberOrPercentage(m[1], 255),
					parseCssNumberOrPercentage(m[2], 255),
					parseCssNumberOrPercentage(m[3], 255)
				];
				if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2])) {
					return null;
				}
				return new Color(comps, 'rgb');
			},
			'func.rgba': (text) => {
				const m = text.match(
					/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/
				);
				if (!m) {
					return null;
				}
				const comps = [
					parseCssNumberOrPercentage(m[1], 255),
					parseCssNumberOrPercentage(m[2], 255),
					parseCssNumberOrPercentage(m[3], 255),
					parseCssNumberOrPercentage(m[4], 1)
				];
				if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2]) || isNaN(comps[3])) {
					return null;
				}
				return new Color(comps, 'rgb');
			},
			'func.hsl': (text) => {
				const m = text.match(
					/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/
				);
				if (!m) {
					return null;
				}
				const comps = [
					parseCssNumberOrAngle(m[1]),
					parseCssNumberOrPercentage(m[2], 100),
					parseCssNumberOrPercentage(m[3], 100)
				];
				if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2])) {
					return null;
				}
				return new Color(comps, 'hsl');
			},
			'func.hsla': (text) => {
				const m = text.match(
					/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/
				);
				if (!m) {
					return null;
				}
				const comps = [
					parseCssNumberOrAngle(m[1]),
					parseCssNumberOrPercentage(m[2], 100),
					parseCssNumberOrPercentage(m[3], 100),
					parseCssNumberOrPercentage(m[4], 1)
				];
				if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2]) || isNaN(comps[3])) {
					return null;
				}
				return new Color(comps, 'hsl');
			},
			'hex.rgb': (text) => {
				const mRgb = text.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
				if (mRgb) {
					return new Color(
						[
							parseInt(mRgb[1] + mRgb[1], 16),
							parseInt(mRgb[2] + mRgb[2], 16),
							parseInt(mRgb[3] + mRgb[3], 16)
						],
						'rgb'
					);
				}
				const mRrggbb = text.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
				if (mRrggbb) {
					return new Color(
						[parseInt(mRrggbb[1], 16), parseInt(mRrggbb[2], 16), parseInt(mRrggbb[3], 16)],
						'rgb'
					);
				}
				return null;
			},
			'hex.rgba': (text) => {
				const mRgb = text.match(/^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
				if (mRgb) {
					return new Color(
						[
							parseInt(mRgb[1] + mRgb[1], 16),
							parseInt(mRgb[2] + mRgb[2], 16),
							parseInt(mRgb[3] + mRgb[3], 16),
							mapRange(parseInt(mRgb[4] + mRgb[4], 16), 0, 255, 0, 1)
						],
						'rgb'
					);
				}
				const mRrggbb = text.match(
					/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/
				);
				if (mRrggbb) {
					return new Color(
						[
							parseInt(mRrggbb[1], 16),
							parseInt(mRrggbb[2], 16),
							parseInt(mRrggbb[3], 16),
							mapRange(parseInt(mRrggbb[4], 16), 0, 255, 0, 1)
						],
						'rgb'
					);
				}
				return null;
			}
		};
		function getColorNotation(text) {
			const notations = Object.keys(NOTATION_TO_PARSER_MAP);
			return notations.reduce((result, notation) => {
				if (result) {
					return result;
				}
				const subparser = NOTATION_TO_PARSER_MAP[notation];
				return subparser(text) ? notation : null;
			}, null);
		}
		const CompositeColorParser = (text) => {
			const notation = getColorNotation(text);
			return notation ? NOTATION_TO_PARSER_MAP[notation](text) : null;
		};
		function hasAlphaComponent(notation) {
			return notation === 'func.hsla' || notation === 'func.rgba' || notation === 'hex.rgba';
		}
		function colorFromString(value) {
			if (typeof value === 'string') {
				const cv = CompositeColorParser(value);
				if (cv) {
					return cv;
				}
			}
			return Color.black();
		}
		function zerofill(comp) {
			const hex = constrainRange(Math.floor(comp), 0, 255).toString(16);
			return hex.length === 1 ? `0${hex}` : hex;
		}
		function colorToHexRgbString(value, prefix = '#') {
			const hexes = removeAlphaComponent(value.getComponents('rgb')).map(zerofill).join('');
			return `${prefix}${hexes}`;
		}
		function colorToHexRgbaString(value, prefix = '#') {
			const rgbaComps = value.getComponents('rgb');
			const hexes = [rgbaComps[0], rgbaComps[1], rgbaComps[2], rgbaComps[3] * 255]
				.map(zerofill)
				.join('');
			return `${prefix}${hexes}`;
		}
		function colorToFunctionalRgbString(value) {
			const formatter = createNumberFormatter(0);
			const comps = removeAlphaComponent(value.getComponents('rgb')).map((comp) => formatter(comp));
			return `rgb(${comps.join(', ')})`;
		}
		function colorToFunctionalRgbaString(value) {
			const aFormatter = createNumberFormatter(2);
			const rgbFormatter = createNumberFormatter(0);
			const comps = value.getComponents('rgb').map((comp, index) => {
				const formatter = index === 3 ? aFormatter : rgbFormatter;
				return formatter(comp);
			});
			return `rgba(${comps.join(', ')})`;
		}
		function colorToFunctionalHslString(value) {
			const formatters = [createNumberFormatter(0), formatPercentage, formatPercentage];
			const comps = removeAlphaComponent(value.getComponents('hsl')).map((comp, index) =>
				formatters[index](comp)
			);
			return `hsl(${comps.join(', ')})`;
		}
		function colorToFunctionalHslaString(value) {
			const formatters = [
				createNumberFormatter(0),
				formatPercentage,
				formatPercentage,
				createNumberFormatter(2)
			];
			const comps = value.getComponents('hsl').map((comp, index) => formatters[index](comp));
			return `hsla(${comps.join(', ')})`;
		}
		const NOTATION_TO_STRINGIFIER_MAP = {
			'func.hsl': colorToFunctionalHslString,
			'func.hsla': colorToFunctionalHslaString,
			'func.rgb': colorToFunctionalRgbString,
			'func.rgba': colorToFunctionalRgbaString,
			'hex.rgb': colorToHexRgbString,
			'hex.rgba': colorToHexRgbaString
		};
		function getColorStringifier(notation) {
			return NOTATION_TO_STRINGIFIER_MAP[notation];
		}

		const className$a = ClassName('apl');
		class APaletteView {
			constructor(doc, config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.value = config.value;
				this.value.emitter.on('change', this.onValueChange_);
				this.element = doc.createElement('div');
				this.element.classList.add(className$a());
				config.viewProps.bindTabIndex(this.element);
				const barElem = doc.createElement('div');
				barElem.classList.add(className$a('b'));
				this.element.appendChild(barElem);
				const colorElem = doc.createElement('div');
				colorElem.classList.add(className$a('c'));
				barElem.appendChild(colorElem);
				this.colorElem_ = colorElem;
				const markerElem = doc.createElement('div');
				markerElem.classList.add(className$a('m'));
				this.element.appendChild(markerElem);
				this.markerElem_ = markerElem;
				const previewElem = doc.createElement('div');
				previewElem.classList.add(className$a('p'));
				this.markerElem_.appendChild(previewElem);
				this.previewElem_ = previewElem;
				this.update_();
			}
			update_() {
				const c = this.value.rawValue;
				const rgbaComps = c.getComponents('rgb');
				const leftColor = new Color([rgbaComps[0], rgbaComps[1], rgbaComps[2], 0], 'rgb');
				const rightColor = new Color([rgbaComps[0], rgbaComps[1], rgbaComps[2], 255], 'rgb');
				const gradientComps = [
					'to right',
					colorToFunctionalRgbaString(leftColor),
					colorToFunctionalRgbaString(rightColor)
				];
				this.colorElem_.style.background = `linear-gradient(${gradientComps.join(',')})`;
				this.previewElem_.style.backgroundColor = colorToFunctionalRgbaString(c);
				const left = mapRange(rgbaComps[3], 0, 1, 0, 100);
				this.markerElem_.style.left = `${left}%`;
			}
			onValueChange_() {
				this.update_();
			}
		}

		class APaletteController {
			constructor(doc, config) {
				this.onKeyDown_ = this.onKeyDown_.bind(this);
				this.onKeyUp_ = this.onKeyUp_.bind(this);
				this.onPointerDown_ = this.onPointerDown_.bind(this);
				this.onPointerMove_ = this.onPointerMove_.bind(this);
				this.onPointerUp_ = this.onPointerUp_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new APaletteView(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				this.ptHandler_ = new PointerHandler(this.view.element);
				this.ptHandler_.emitter.on('down', this.onPointerDown_);
				this.ptHandler_.emitter.on('move', this.onPointerMove_);
				this.ptHandler_.emitter.on('up', this.onPointerUp_);
				this.view.element.addEventListener('keydown', this.onKeyDown_);
				this.view.element.addEventListener('keyup', this.onKeyUp_);
			}
			handlePointerEvent_(d, opts) {
				if (!d.point) {
					return;
				}
				const alpha = d.point.x / d.bounds.width;
				const c = this.value.rawValue;
				const [h, s, v] = c.getComponents('hsv');
				this.value.setRawValue(new Color([h, s, v, alpha], 'hsv'), opts);
			}
			onPointerDown_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerMove_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerUp_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: true,
					last: true
				});
			}
			onKeyDown_(ev) {
				const step = getStepForKey(getBaseStepForColor(true), getHorizontalStepKeys(ev));
				if (step === 0) {
					return;
				}
				const c = this.value.rawValue;
				const [h, s, v, a] = c.getComponents('hsv');
				this.value.setRawValue(new Color([h, s, v, a + step], 'hsv'), {
					forceEmit: false,
					last: false
				});
			}
			onKeyUp_(ev) {
				const step = getStepForKey(getBaseStepForColor(true), getHorizontalStepKeys(ev));
				if (step === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue, {
					forceEmit: true,
					last: true
				});
			}
		}

		const className$9 = ClassName('coltxt');
		function createModeSelectElement(doc) {
			const selectElem = doc.createElement('select');
			const items = [
				{ text: 'RGB', value: 'rgb' },
				{ text: 'HSL', value: 'hsl' },
				{ text: 'HSV', value: 'hsv' }
			];
			selectElem.appendChild(
				items.reduce((frag, item) => {
					const optElem = doc.createElement('option');
					optElem.textContent = item.text;
					optElem.value = item.value;
					frag.appendChild(optElem);
					return frag;
				}, doc.createDocumentFragment())
			);
			return selectElem;
		}
		class ColorTextView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$9());
				const modeElem = doc.createElement('div');
				modeElem.classList.add(className$9('m'));
				this.modeElem_ = createModeSelectElement(doc);
				this.modeElem_.classList.add(className$9('ms'));
				modeElem.appendChild(this.modeSelectElement);
				const modeMarkerElem = doc.createElement('div');
				modeMarkerElem.classList.add(className$9('mm'));
				modeMarkerElem.appendChild(createSvgIconElement(doc, 'dropdown'));
				modeElem.appendChild(modeMarkerElem);
				this.element.appendChild(modeElem);
				const textsElem = doc.createElement('div');
				textsElem.classList.add(className$9('w'));
				this.element.appendChild(textsElem);
				this.textsElem_ = textsElem;
				this.textViews_ = config.textViews;
				this.applyTextViews_();
				bindValue(config.colorMode, (mode) => {
					this.modeElem_.value = mode;
				});
			}
			get modeSelectElement() {
				return this.modeElem_;
			}
			get textViews() {
				return this.textViews_;
			}
			set textViews(textViews) {
				this.textViews_ = textViews;
				this.applyTextViews_();
			}
			applyTextViews_() {
				removeChildElements(this.textsElem_);
				const doc = this.element.ownerDocument;
				this.textViews_.forEach((v) => {
					const compElem = doc.createElement('div');
					compElem.classList.add(className$9('c'));
					compElem.appendChild(v.element);
					this.textsElem_.appendChild(compElem);
				});
			}
		}

		const FORMATTER = createNumberFormatter(0);
		const MODE_TO_CONSTRAINT_MAP = {
			rgb: () => {
				return new RangeConstraint({ min: 0, max: 255 });
			},
			hsl: (index) => {
				return index === 0
					? new RangeConstraint({ min: 0, max: 360 })
					: new RangeConstraint({ min: 0, max: 100 });
			},
			hsv: (index) => {
				return index === 0
					? new RangeConstraint({ min: 0, max: 360 })
					: new RangeConstraint({ min: 0, max: 100 });
			}
		};
		function createComponentController(doc, config, index) {
			return new NumberTextController(doc, {
				arrayPosition: index === 0 ? 'fst' : index === 3 - 1 ? 'lst' : 'mid',
				baseStep: getBaseStepForColor(false),
				parser: config.parser,
				props: ValueMap.fromObject({
					draggingScale: 1,
					formatter: FORMATTER
				}),
				value: createValue(0, {
					constraint: MODE_TO_CONSTRAINT_MAP[config.colorMode](index)
				}),
				viewProps: config.viewProps
			});
		}
		class ColorTextController {
			constructor(doc, config) {
				this.onModeSelectChange_ = this.onModeSelectChange_.bind(this);
				this.parser_ = config.parser;
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.colorMode = createValue(this.value.rawValue.mode);
				this.ccs_ = this.createComponentControllers_(doc);
				this.view = new ColorTextView(doc, {
					colorMode: this.colorMode,
					textViews: [this.ccs_[0].view, this.ccs_[1].view, this.ccs_[2].view]
				});
				this.view.modeSelectElement.addEventListener('change', this.onModeSelectChange_);
			}
			createComponentControllers_(doc) {
				const cc = {
					colorMode: this.colorMode.rawValue,
					parser: this.parser_,
					viewProps: this.viewProps
				};
				const ccs = [
					createComponentController(doc, cc, 0),
					createComponentController(doc, cc, 1),
					createComponentController(doc, cc, 2)
				];
				ccs.forEach((cs, index) => {
					connectValues({
						primary: this.value,
						secondary: cs.value,
						forward: (p) => {
							return p.rawValue.getComponents(this.colorMode.rawValue)[index];
						},
						backward: (p, s) => {
							const pickedMode = this.colorMode.rawValue;
							const comps = p.rawValue.getComponents(pickedMode);
							comps[index] = s.rawValue;
							return new Color(
								appendAlphaComponent(removeAlphaComponent(comps), comps[3]),
								pickedMode
							);
						}
					});
				});
				return ccs;
			}
			onModeSelectChange_(ev) {
				const selectElem = ev.currentTarget;
				this.colorMode.rawValue = selectElem.value;
				this.ccs_ = this.createComponentControllers_(this.view.element.ownerDocument);
				this.view.textViews = [this.ccs_[0].view, this.ccs_[1].view, this.ccs_[2].view];
			}
		}

		const className$8 = ClassName('hpl');
		class HPaletteView {
			constructor(doc, config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.value = config.value;
				this.value.emitter.on('change', this.onValueChange_);
				this.element = doc.createElement('div');
				this.element.classList.add(className$8());
				config.viewProps.bindTabIndex(this.element);
				const colorElem = doc.createElement('div');
				colorElem.classList.add(className$8('c'));
				this.element.appendChild(colorElem);
				const markerElem = doc.createElement('div');
				markerElem.classList.add(className$8('m'));
				this.element.appendChild(markerElem);
				this.markerElem_ = markerElem;
				this.update_();
			}
			update_() {
				const c = this.value.rawValue;
				const [h] = c.getComponents('hsv');
				this.markerElem_.style.backgroundColor = colorToFunctionalRgbString(
					new Color([h, 100, 100], 'hsv')
				);
				const left = mapRange(h, 0, 360, 0, 100);
				this.markerElem_.style.left = `${left}%`;
			}
			onValueChange_() {
				this.update_();
			}
		}

		class HPaletteController {
			constructor(doc, config) {
				this.onKeyDown_ = this.onKeyDown_.bind(this);
				this.onKeyUp_ = this.onKeyUp_.bind(this);
				this.onPointerDown_ = this.onPointerDown_.bind(this);
				this.onPointerMove_ = this.onPointerMove_.bind(this);
				this.onPointerUp_ = this.onPointerUp_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new HPaletteView(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				this.ptHandler_ = new PointerHandler(this.view.element);
				this.ptHandler_.emitter.on('down', this.onPointerDown_);
				this.ptHandler_.emitter.on('move', this.onPointerMove_);
				this.ptHandler_.emitter.on('up', this.onPointerUp_);
				this.view.element.addEventListener('keydown', this.onKeyDown_);
				this.view.element.addEventListener('keyup', this.onKeyUp_);
			}
			handlePointerEvent_(d, opts) {
				if (!d.point) {
					return;
				}
				const hue = mapRange(d.point.x, 0, d.bounds.width, 0, 360);
				const c = this.value.rawValue;
				const [, s, v, a] = c.getComponents('hsv');
				this.value.setRawValue(new Color([hue, s, v, a], 'hsv'), opts);
			}
			onPointerDown_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerMove_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerUp_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: true,
					last: true
				});
			}
			onKeyDown_(ev) {
				const step = getStepForKey(getBaseStepForColor(false), getHorizontalStepKeys(ev));
				if (step === 0) {
					return;
				}
				const c = this.value.rawValue;
				const [h, s, v, a] = c.getComponents('hsv');
				this.value.setRawValue(new Color([h + step, s, v, a], 'hsv'), {
					forceEmit: false,
					last: false
				});
			}
			onKeyUp_(ev) {
				const step = getStepForKey(getBaseStepForColor(false), getHorizontalStepKeys(ev));
				if (step === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue, {
					forceEmit: true,
					last: true
				});
			}
		}

		const className$7 = ClassName('svp');
		const CANVAS_RESOL = 64;
		class SvPaletteView {
			constructor(doc, config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.value = config.value;
				this.value.emitter.on('change', this.onValueChange_);
				this.element = doc.createElement('div');
				this.element.classList.add(className$7());
				config.viewProps.bindTabIndex(this.element);
				const canvasElem = doc.createElement('canvas');
				canvasElem.height = CANVAS_RESOL;
				canvasElem.width = CANVAS_RESOL;
				canvasElem.classList.add(className$7('c'));
				this.element.appendChild(canvasElem);
				this.canvasElement = canvasElem;
				const markerElem = doc.createElement('div');
				markerElem.classList.add(className$7('m'));
				this.element.appendChild(markerElem);
				this.markerElem_ = markerElem;
				this.update_();
			}
			update_() {
				const ctx = getCanvasContext(this.canvasElement);
				if (!ctx) {
					return;
				}
				const c = this.value.rawValue;
				const hsvComps = c.getComponents('hsv');
				const width = this.canvasElement.width;
				const height = this.canvasElement.height;
				const imgData = ctx.getImageData(0, 0, width, height);
				const data = imgData.data;
				for (let iy = 0; iy < height; iy++) {
					for (let ix = 0; ix < width; ix++) {
						const s = mapRange(ix, 0, width, 0, 100);
						const v = mapRange(iy, 0, height, 100, 0);
						const rgbComps = hsvToRgb(hsvComps[0], s, v);
						const i = (iy * width + ix) * 4;
						data[i] = rgbComps[0];
						data[i + 1] = rgbComps[1];
						data[i + 2] = rgbComps[2];
						data[i + 3] = 255;
					}
				}
				ctx.putImageData(imgData, 0, 0);
				const left = mapRange(hsvComps[1], 0, 100, 0, 100);
				this.markerElem_.style.left = `${left}%`;
				const top = mapRange(hsvComps[2], 0, 100, 100, 0);
				this.markerElem_.style.top = `${top}%`;
			}
			onValueChange_() {
				this.update_();
			}
		}

		class SvPaletteController {
			constructor(doc, config) {
				this.onKeyDown_ = this.onKeyDown_.bind(this);
				this.onKeyUp_ = this.onKeyUp_.bind(this);
				this.onPointerDown_ = this.onPointerDown_.bind(this);
				this.onPointerMove_ = this.onPointerMove_.bind(this);
				this.onPointerUp_ = this.onPointerUp_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new SvPaletteView(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				this.ptHandler_ = new PointerHandler(this.view.element);
				this.ptHandler_.emitter.on('down', this.onPointerDown_);
				this.ptHandler_.emitter.on('move', this.onPointerMove_);
				this.ptHandler_.emitter.on('up', this.onPointerUp_);
				this.view.element.addEventListener('keydown', this.onKeyDown_);
				this.view.element.addEventListener('keyup', this.onKeyUp_);
			}
			handlePointerEvent_(d, opts) {
				if (!d.point) {
					return;
				}
				const saturation = mapRange(d.point.x, 0, d.bounds.width, 0, 100);
				const value = mapRange(d.point.y, 0, d.bounds.height, 100, 0);
				const [h, , , a] = this.value.rawValue.getComponents('hsv');
				this.value.setRawValue(new Color([h, saturation, value, a], 'hsv'), opts);
			}
			onPointerDown_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerMove_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerUp_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: true,
					last: true
				});
			}
			onKeyDown_(ev) {
				if (isArrowKey(ev.key)) {
					ev.preventDefault();
				}
				const [h, s, v, a] = this.value.rawValue.getComponents('hsv');
				const baseStep = getBaseStepForColor(false);
				const ds = getStepForKey(baseStep, getHorizontalStepKeys(ev));
				const dv = getStepForKey(baseStep, getVerticalStepKeys(ev));
				if (ds === 0 && dv === 0) {
					return;
				}
				this.value.setRawValue(new Color([h, s + ds, v + dv, a], 'hsv'), {
					forceEmit: false,
					last: false
				});
			}
			onKeyUp_(ev) {
				const baseStep = getBaseStepForColor(false);
				const ds = getStepForKey(baseStep, getHorizontalStepKeys(ev));
				const dv = getStepForKey(baseStep, getVerticalStepKeys(ev));
				if (ds === 0 && dv === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue, {
					forceEmit: true,
					last: true
				});
			}
		}

		class ColorPickerController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.hPaletteC_ = new HPaletteController(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				this.svPaletteC_ = new SvPaletteController(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				this.alphaIcs_ = config.supportsAlpha
					? {
							palette: new APaletteController(doc, {
								value: this.value,
								viewProps: this.viewProps
							}),
							text: new NumberTextController(doc, {
								parser: parseNumber,
								baseStep: 0.1,
								props: ValueMap.fromObject({
									draggingScale: 0.01,
									formatter: createNumberFormatter(2)
								}),
								value: createValue(0, {
									constraint: new RangeConstraint({ min: 0, max: 1 })
								}),
								viewProps: this.viewProps
							})
					  }
					: null;
				if (this.alphaIcs_) {
					connectValues({
						primary: this.value,
						secondary: this.alphaIcs_.text.value,
						forward: (p) => {
							return p.rawValue.getComponents()[3];
						},
						backward: (p, s) => {
							const comps = p.rawValue.getComponents();
							comps[3] = s.rawValue;
							return new Color(comps, p.rawValue.mode);
						}
					});
				}
				this.textC_ = new ColorTextController(doc, {
					parser: parseNumber,
					value: this.value,
					viewProps: this.viewProps
				});
				this.view = new ColorPickerView(doc, {
					alphaViews: this.alphaIcs_
						? {
								palette: this.alphaIcs_.palette.view,
								text: this.alphaIcs_.text.view
						  }
						: null,
					hPaletteView: this.hPaletteC_.view,
					supportsAlpha: config.supportsAlpha,
					svPaletteView: this.svPaletteC_.view,
					textView: this.textC_.view
				});
			}
			get textController() {
				return this.textC_;
			}
		}

		const className$6 = ClassName('colsw');
		class ColorSwatchView {
			constructor(doc, config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				config.value.emitter.on('change', this.onValueChange_);
				this.value = config.value;
				this.element = doc.createElement('div');
				this.element.classList.add(className$6());
				config.viewProps.bindClassModifiers(this.element);
				const swatchElem = doc.createElement('div');
				swatchElem.classList.add(className$6('sw'));
				this.element.appendChild(swatchElem);
				this.swatchElem_ = swatchElem;
				const buttonElem = doc.createElement('button');
				buttonElem.classList.add(className$6('b'));
				config.viewProps.bindDisabled(buttonElem);
				this.element.appendChild(buttonElem);
				this.buttonElement = buttonElem;
				this.update_();
			}
			update_() {
				const value = this.value.rawValue;
				this.swatchElem_.style.backgroundColor = colorToHexRgbaString(value);
			}
			onValueChange_() {
				this.update_();
			}
		}

		class ColorSwatchController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new ColorSwatchView(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
			}
		}

		class ColorController {
			constructor(doc, config) {
				this.onButtonBlur_ = this.onButtonBlur_.bind(this);
				this.onButtonClick_ = this.onButtonClick_.bind(this);
				this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
				this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.foldable_ = Foldable.create(config.expanded);
				this.swatchC_ = new ColorSwatchController(doc, {
					value: this.value,
					viewProps: this.viewProps
				});
				const buttonElem = this.swatchC_.view.buttonElement;
				buttonElem.addEventListener('blur', this.onButtonBlur_);
				buttonElem.addEventListener('click', this.onButtonClick_);
				this.textC_ = new TextController(doc, {
					parser: config.parser,
					props: ValueMap.fromObject({
						formatter: config.formatter
					}),
					value: this.value,
					viewProps: this.viewProps
				});
				this.view = new ColorView(doc, {
					foldable: this.foldable_,
					pickerLayout: config.pickerLayout
				});
				this.view.swatchElement.appendChild(this.swatchC_.view.element);
				this.view.textElement.appendChild(this.textC_.view.element);
				this.popC_ =
					config.pickerLayout === 'popup'
						? new PopupController(doc, {
								viewProps: this.viewProps
						  })
						: null;
				const pickerC = new ColorPickerController(doc, {
					supportsAlpha: config.supportsAlpha,
					value: this.value,
					viewProps: this.viewProps
				});
				pickerC.view.allFocusableElements.forEach((elem) => {
					elem.addEventListener('blur', this.onPopupChildBlur_);
					elem.addEventListener('keydown', this.onPopupChildKeydown_);
				});
				this.pickerC_ = pickerC;
				if (this.popC_) {
					this.view.element.appendChild(this.popC_.view.element);
					this.popC_.view.element.appendChild(pickerC.view.element);
					connectValues({
						primary: this.foldable_.value('expanded'),
						secondary: this.popC_.shows,
						forward: (p) => p.rawValue,
						backward: (_, s) => s.rawValue
					});
				} else if (this.view.pickerElement) {
					this.view.pickerElement.appendChild(this.pickerC_.view.element);
					bindFoldable(this.foldable_, this.view.pickerElement);
				}
			}
			get textController() {
				return this.textC_;
			}
			onButtonBlur_(e) {
				if (!this.popC_) {
					return;
				}
				const elem = this.view.element;
				const nextTarget = forceCast(e.relatedTarget);
				if (!nextTarget || !elem.contains(nextTarget)) {
					this.popC_.shows.rawValue = false;
				}
			}
			onButtonClick_() {
				this.foldable_.set('expanded', !this.foldable_.get('expanded'));
				if (this.foldable_.get('expanded')) {
					this.pickerC_.view.allFocusableElements[0].focus();
				}
			}
			onPopupChildBlur_(ev) {
				if (!this.popC_) {
					return;
				}
				const elem = this.popC_.view.element;
				const nextTarget = findNextTarget(ev);
				if (nextTarget && elem.contains(nextTarget)) {
					return;
				}
				if (
					nextTarget &&
					nextTarget === this.swatchC_.view.buttonElement &&
					!supportsTouch(elem.ownerDocument)
				) {
					return;
				}
				this.popC_.shows.rawValue = false;
			}
			onPopupChildKeydown_(ev) {
				if (this.popC_) {
					if (ev.key === 'Escape') {
						this.popC_.shows.rawValue = false;
					}
				} else if (this.view.pickerElement) {
					if (ev.key === 'Escape') {
						this.swatchC_.view.buttonElement.focus();
					}
				}
			}
		}

		function colorFromObject(value) {
			if (Color.isColorObject(value)) {
				return Color.fromObject(value);
			}
			return Color.black();
		}
		function colorToRgbNumber(value) {
			return removeAlphaComponent(value.getComponents('rgb')).reduce((result, comp) => {
				return (result << 8) | (Math.floor(comp) & 0xff);
			}, 0);
		}
		function colorToRgbaNumber(value) {
			return (
				value.getComponents('rgb').reduce((result, comp, index) => {
					const hex = Math.floor(index === 3 ? comp * 255 : comp) & 0xff;
					return (result << 8) | hex;
				}, 0) >>> 0
			);
		}
		function numberToRgbColor(num) {
			return new Color([(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff], 'rgb');
		}
		function numberToRgbaColor(num) {
			return new Color(
				[
					(num >> 24) & 0xff,
					(num >> 16) & 0xff,
					(num >> 8) & 0xff,
					mapRange(num & 0xff, 0, 255, 0, 1)
				],
				'rgb'
			);
		}
		function colorFromRgbNumber(value) {
			if (typeof value !== 'number') {
				return Color.black();
			}
			return numberToRgbColor(value);
		}
		function colorFromRgbaNumber(value) {
			if (typeof value !== 'number') {
				return Color.black();
			}
			return numberToRgbaColor(value);
		}

		function createColorStringWriter(notation) {
			const stringify = getColorStringifier(notation);
			return (target, value) => {
				writePrimitive(target, stringify(value));
			};
		}
		function createColorNumberWriter(supportsAlpha) {
			const colorToNumber = supportsAlpha ? colorToRgbaNumber : colorToRgbNumber;
			return (target, value) => {
				writePrimitive(target, colorToNumber(value));
			};
		}
		function writeRgbaColorObject(target, value) {
			const obj = value.toRgbaObject();
			target.writeProperty('r', obj.r);
			target.writeProperty('g', obj.g);
			target.writeProperty('b', obj.b);
			target.writeProperty('a', obj.a);
		}
		function writeRgbColorObject(target, value) {
			const obj = value.toRgbaObject();
			target.writeProperty('r', obj.r);
			target.writeProperty('g', obj.g);
			target.writeProperty('b', obj.b);
		}
		function createColorObjectWriter(supportsAlpha) {
			return supportsAlpha ? writeRgbaColorObject : writeRgbColorObject;
		}

		function shouldSupportAlpha$1(inputParams) {
			return 'alpha' in inputParams && inputParams.alpha === true;
		}
		function createFormatter$1(supportsAlpha) {
			return supportsAlpha
				? (v) => colorToHexRgbaString(v, '0x')
				: (v) => colorToHexRgbString(v, '0x');
		}
		const NumberColorInputPlugin = {
			id: 'input-color-number',
			type: 'input',
			accept: (value, params) => {
				if (typeof value !== 'number') {
					return null;
				}
				if (!('view' in params)) {
					return null;
				}
				if (params.view !== 'color') {
					return null;
				}
				const result = parseColorInputParams(params);
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (args) => {
					return shouldSupportAlpha$1(args.params) ? colorFromRgbaNumber : colorFromRgbNumber;
				},
				equals: Color.equals,
				writer: (args) => {
					return createColorNumberWriter(shouldSupportAlpha$1(args.params));
				}
			},
			controller: (args) => {
				const supportsAlpha = shouldSupportAlpha$1(args.params);
				const expanded = 'expanded' in args.params ? args.params.expanded : undefined;
				const picker = 'picker' in args.params ? args.params.picker : undefined;
				return new ColorController(args.document, {
					expanded: expanded !== null && expanded !== void 0 ? expanded : false,
					formatter: createFormatter$1(supportsAlpha),
					parser: CompositeColorParser,
					pickerLayout: picker !== null && picker !== void 0 ? picker : 'popup',
					supportsAlpha: supportsAlpha,
					value: args.value,
					viewProps: args.viewProps
				});
			}
		};

		function shouldSupportAlpha(initialValue) {
			return Color.isRgbaColorObject(initialValue);
		}
		const ObjectColorInputPlugin = {
			id: 'input-color-object',
			type: 'input',
			accept: (value, params) => {
				if (!Color.isColorObject(value)) {
					return null;
				}
				const result = parseColorInputParams(params);
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => colorFromObject,
				equals: Color.equals,
				writer: (args) => createColorObjectWriter(shouldSupportAlpha(args.initialValue))
			},
			controller: (args) => {
				const supportsAlpha = Color.isRgbaColorObject(args.initialValue);
				const expanded = 'expanded' in args.params ? args.params.expanded : undefined;
				const picker = 'picker' in args.params ? args.params.picker : undefined;
				const formatter = supportsAlpha ? colorToHexRgbaString : colorToHexRgbString;
				return new ColorController(args.document, {
					expanded: expanded !== null && expanded !== void 0 ? expanded : false,
					formatter: formatter,
					parser: CompositeColorParser,
					pickerLayout: picker !== null && picker !== void 0 ? picker : 'popup',
					supportsAlpha: supportsAlpha,
					value: args.value,
					viewProps: args.viewProps
				});
			}
		};

		const StringColorInputPlugin = {
			id: 'input-color-string',
			type: 'input',
			accept: (value, params) => {
				if (typeof value !== 'string') {
					return null;
				}
				if ('view' in params && params.view === 'text') {
					return null;
				}
				const notation = getColorNotation(value);
				if (!notation) {
					return null;
				}
				const result = parseColorInputParams(params);
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => colorFromString,
				equals: Color.equals,
				writer: (args) => {
					const notation = getColorNotation(args.initialValue);
					if (!notation) {
						throw TpError.shouldNeverHappen();
					}
					return createColorStringWriter(notation);
				}
			},
			controller: (args) => {
				const notation = getColorNotation(args.initialValue);
				if (!notation) {
					throw TpError.shouldNeverHappen();
				}
				const stringifier = getColorStringifier(notation);
				const expanded = 'expanded' in args.params ? args.params.expanded : undefined;
				const picker = 'picker' in args.params ? args.params.picker : undefined;
				return new ColorController(args.document, {
					expanded: expanded !== null && expanded !== void 0 ? expanded : false,
					formatter: stringifier,
					parser: CompositeColorParser,
					pickerLayout: picker !== null && picker !== void 0 ? picker : 'popup',
					supportsAlpha: hasAlphaComponent(notation),
					value: args.value,
					viewProps: args.viewProps
				});
			}
		};

		class PointNdConstraint {
			constructor(config) {
				this.components = config.components;
				this.asm_ = config.assembly;
			}
			constrain(value) {
				const comps = this.asm_.toComponents(value).map((comp, index) => {
					var _a, _b;
					return (_b =
						(_a = this.components[index]) === null || _a === void 0
							? void 0
							: _a.constrain(comp)) !== null && _b !== void 0
						? _b
						: comp;
				});
				return this.asm_.fromComponents(comps);
			}
		}

		const className$5 = ClassName('pndtxt');
		class PointNdTextView {
			constructor(doc, config) {
				this.textViews = config.textViews;
				this.element = doc.createElement('div');
				this.element.classList.add(className$5());
				this.textViews.forEach((v) => {
					const axisElem = doc.createElement('div');
					axisElem.classList.add(className$5('a'));
					axisElem.appendChild(v.element);
					this.element.appendChild(axisElem);
				});
			}
		}

		function createAxisController(doc, config, index) {
			return new NumberTextController(doc, {
				arrayPosition: index === 0 ? 'fst' : index === config.axes.length - 1 ? 'lst' : 'mid',
				baseStep: config.axes[index].baseStep,
				parser: config.parser,
				props: config.axes[index].textProps,
				value: createValue(0, {
					constraint: config.axes[index].constraint
				}),
				viewProps: config.viewProps
			});
		}
		class PointNdTextController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.acs_ = config.axes.map((_, index) => createAxisController(doc, config, index));
				this.acs_.forEach((c, index) => {
					connectValues({
						primary: this.value,
						secondary: c.value,
						forward: (p) => {
							return config.assembly.toComponents(p.rawValue)[index];
						},
						backward: (p, s) => {
							const comps = config.assembly.toComponents(p.rawValue);
							comps[index] = s.rawValue;
							return config.assembly.fromComponents(comps);
						}
					});
				});
				this.view = new PointNdTextView(doc, {
					textViews: this.acs_.map((ac) => ac.view)
				});
			}
		}

		function createStepConstraint(params) {
			if ('step' in params && !isEmpty(params.step)) {
				return new StepConstraint(params.step);
			}
			return null;
		}
		function createRangeConstraint(params) {
			if (('max' in params && !isEmpty(params.max)) || ('min' in params && !isEmpty(params.min))) {
				return new RangeConstraint({
					max: params.max,
					min: params.min
				});
			}
			return null;
		}
		function createConstraint$4(params) {
			const constraints = [];
			const sc = createStepConstraint(params);
			if (sc) {
				constraints.push(sc);
			}
			const rc = createRangeConstraint(params);
			if (rc) {
				constraints.push(rc);
			}
			const lc = createListConstraint(params.options);
			if (lc) {
				constraints.push(lc);
			}
			return new CompositeConstraint(constraints);
		}
		function findRange(constraint) {
			const c = constraint ? findConstraint(constraint, RangeConstraint) : null;
			if (!c) {
				return [undefined, undefined];
			}
			return [c.minValue, c.maxValue];
		}
		function estimateSuitableRange(constraint) {
			const [min, max] = findRange(constraint);
			return [min !== null && min !== void 0 ? min : 0, max !== null && max !== void 0 ? max : 100];
		}
		const NumberInputPlugin = {
			id: 'input-number',
			type: 'input',
			accept: (value, params) => {
				if (typeof value !== 'number') {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					format: p.optional.function,
					max: p.optional.number,
					min: p.optional.number,
					options: p.optional.custom(parseListOptions),
					step: p.optional.number
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => numberFromUnknown,
				constraint: (args) => createConstraint$4(args.params),
				writer: (_args) => writePrimitive
			},
			controller: (args) => {
				var _a, _b;
				const value = args.value;
				const c = args.constraint;
				if (c && findConstraint(c, ListConstraint)) {
					return new ListController(args.document, {
						props: ValueMap.fromObject({
							options: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : []
						}),
						value: value,
						viewProps: args.viewProps
					});
				}
				const formatter =
					(_b = 'format' in args.params ? args.params.format : undefined) !== null && _b !== void 0
						? _b
						: createNumberFormatter(getSuitableDecimalDigits(c, value.rawValue));
				if (c && findConstraint(c, RangeConstraint)) {
					const [min, max] = estimateSuitableRange(c);
					return new SliderTextController(args.document, {
						baseStep: getBaseStep(c),
						parser: parseNumber,
						sliderProps: ValueMap.fromObject({
							maxValue: max,
							minValue: min
						}),
						textProps: ValueMap.fromObject({
							draggingScale: getSuitableDraggingScale(c, value.rawValue),
							formatter: formatter
						}),
						value: value,
						viewProps: args.viewProps
					});
				}
				return new NumberTextController(args.document, {
					baseStep: getBaseStep(c),
					parser: parseNumber,
					props: ValueMap.fromObject({
						draggingScale: getSuitableDraggingScale(c, value.rawValue),
						formatter: formatter
					}),
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		class Point2d {
			constructor(x = 0, y = 0) {
				this.x = x;
				this.y = y;
			}
			getComponents() {
				return [this.x, this.y];
			}
			static isObject(obj) {
				if (isEmpty(obj)) {
					return false;
				}
				const x = obj.x;
				const y = obj.y;
				if (typeof x !== 'number' || typeof y !== 'number') {
					return false;
				}
				return true;
			}
			static equals(v1, v2) {
				return v1.x === v2.x && v1.y === v2.y;
			}
			toObject() {
				return {
					x: this.x,
					y: this.y
				};
			}
		}
		const Point2dAssembly = {
			toComponents: (p) => p.getComponents(),
			fromComponents: (comps) => new Point2d(...comps)
		};

		const className$4 = ClassName('p2d');
		class Point2dView {
			constructor(doc, config) {
				this.element = doc.createElement('div');
				this.element.classList.add(className$4());
				config.viewProps.bindClassModifiers(this.element);
				bindValue(
					config.expanded,
					valueToClassName(this.element, className$4(undefined, 'expanded'))
				);
				const headElem = doc.createElement('div');
				headElem.classList.add(className$4('h'));
				this.element.appendChild(headElem);
				const buttonElem = doc.createElement('button');
				buttonElem.classList.add(className$4('b'));
				buttonElem.appendChild(createSvgIconElement(doc, 'p2dpad'));
				config.viewProps.bindDisabled(buttonElem);
				headElem.appendChild(buttonElem);
				this.buttonElement = buttonElem;
				const textElem = doc.createElement('div');
				textElem.classList.add(className$4('t'));
				headElem.appendChild(textElem);
				this.textElement = textElem;
				if (config.pickerLayout === 'inline') {
					const pickerElem = doc.createElement('div');
					pickerElem.classList.add(className$4('p'));
					this.element.appendChild(pickerElem);
					this.pickerElement = pickerElem;
				} else {
					this.pickerElement = null;
				}
			}
		}

		const className$3 = ClassName('p2dp');
		class Point2dPickerView {
			constructor(doc, config) {
				this.onFoldableChange_ = this.onFoldableChange_.bind(this);
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.invertsY_ = config.invertsY;
				this.maxValue_ = config.maxValue;
				this.element = doc.createElement('div');
				this.element.classList.add(className$3());
				if (config.layout === 'popup') {
					this.element.classList.add(className$3(undefined, 'p'));
				}
				const padElem = doc.createElement('div');
				padElem.classList.add(className$3('p'));
				config.viewProps.bindTabIndex(padElem);
				this.element.appendChild(padElem);
				this.padElement = padElem;
				const svgElem = doc.createElementNS(SVG_NS, 'svg');
				svgElem.classList.add(className$3('g'));
				this.padElement.appendChild(svgElem);
				this.svgElem_ = svgElem;
				const xAxisElem = doc.createElementNS(SVG_NS, 'line');
				xAxisElem.classList.add(className$3('ax'));
				xAxisElem.setAttributeNS(null, 'x1', '0');
				xAxisElem.setAttributeNS(null, 'y1', '50%');
				xAxisElem.setAttributeNS(null, 'x2', '100%');
				xAxisElem.setAttributeNS(null, 'y2', '50%');
				this.svgElem_.appendChild(xAxisElem);
				const yAxisElem = doc.createElementNS(SVG_NS, 'line');
				yAxisElem.classList.add(className$3('ax'));
				yAxisElem.setAttributeNS(null, 'x1', '50%');
				yAxisElem.setAttributeNS(null, 'y1', '0');
				yAxisElem.setAttributeNS(null, 'x2', '50%');
				yAxisElem.setAttributeNS(null, 'y2', '100%');
				this.svgElem_.appendChild(yAxisElem);
				const lineElem = doc.createElementNS(SVG_NS, 'line');
				lineElem.classList.add(className$3('l'));
				lineElem.setAttributeNS(null, 'x1', '50%');
				lineElem.setAttributeNS(null, 'y1', '50%');
				this.svgElem_.appendChild(lineElem);
				this.lineElem_ = lineElem;
				const markerElem = doc.createElement('div');
				markerElem.classList.add(className$3('m'));
				this.padElement.appendChild(markerElem);
				this.markerElem_ = markerElem;
				config.value.emitter.on('change', this.onValueChange_);
				this.value = config.value;
				this.update_();
			}
			get allFocusableElements() {
				return [this.padElement];
			}
			update_() {
				const [x, y] = this.value.rawValue.getComponents();
				const max = this.maxValue_;
				const px = mapRange(x, -max, +max, 0, 100);
				const py = mapRange(y, -max, +max, 0, 100);
				const ipy = this.invertsY_ ? 100 - py : py;
				this.lineElem_.setAttributeNS(null, 'x2', `${px}%`);
				this.lineElem_.setAttributeNS(null, 'y2', `${ipy}%`);
				this.markerElem_.style.left = `${px}%`;
				this.markerElem_.style.top = `${ipy}%`;
			}
			onValueChange_() {
				this.update_();
			}
			onFoldableChange_() {
				this.update_();
			}
		}

		function computeOffset(ev, baseSteps, invertsY) {
			return [
				getStepForKey(baseSteps[0], getHorizontalStepKeys(ev)),
				getStepForKey(baseSteps[1], getVerticalStepKeys(ev)) * (invertsY ? 1 : -1)
			];
		}
		class Point2dPickerController {
			constructor(doc, config) {
				this.onPadKeyDown_ = this.onPadKeyDown_.bind(this);
				this.onPadKeyUp_ = this.onPadKeyUp_.bind(this);
				this.onPointerDown_ = this.onPointerDown_.bind(this);
				this.onPointerMove_ = this.onPointerMove_.bind(this);
				this.onPointerUp_ = this.onPointerUp_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.baseSteps_ = config.baseSteps;
				this.maxValue_ = config.maxValue;
				this.invertsY_ = config.invertsY;
				this.view = new Point2dPickerView(doc, {
					invertsY: this.invertsY_,
					layout: config.layout,
					maxValue: this.maxValue_,
					value: this.value,
					viewProps: this.viewProps
				});
				this.ptHandler_ = new PointerHandler(this.view.padElement);
				this.ptHandler_.emitter.on('down', this.onPointerDown_);
				this.ptHandler_.emitter.on('move', this.onPointerMove_);
				this.ptHandler_.emitter.on('up', this.onPointerUp_);
				this.view.padElement.addEventListener('keydown', this.onPadKeyDown_);
				this.view.padElement.addEventListener('keyup', this.onPadKeyUp_);
			}
			handlePointerEvent_(d, opts) {
				if (!d.point) {
					return;
				}
				const max = this.maxValue_;
				const px = mapRange(d.point.x, 0, d.bounds.width, -max, +max);
				const py = mapRange(
					this.invertsY_ ? d.bounds.height - d.point.y : d.point.y,
					0,
					d.bounds.height,
					-max,
					+max
				);
				this.value.setRawValue(new Point2d(px, py), opts);
			}
			onPointerDown_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerMove_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: false,
					last: false
				});
			}
			onPointerUp_(ev) {
				this.handlePointerEvent_(ev.data, {
					forceEmit: true,
					last: true
				});
			}
			onPadKeyDown_(ev) {
				if (isArrowKey(ev.key)) {
					ev.preventDefault();
				}
				const [dx, dy] = computeOffset(ev, this.baseSteps_, this.invertsY_);
				if (dx === 0 && dy === 0) {
					return;
				}
				this.value.setRawValue(
					new Point2d(this.value.rawValue.x + dx, this.value.rawValue.y + dy),
					{
						forceEmit: false,
						last: false
					}
				);
			}
			onPadKeyUp_(ev) {
				const [dx, dy] = computeOffset(ev, this.baseSteps_, this.invertsY_);
				if (dx === 0 && dy === 0) {
					return;
				}
				this.value.setRawValue(this.value.rawValue, {
					forceEmit: true,
					last: true
				});
			}
		}

		class Point2dController {
			constructor(doc, config) {
				var _a, _b;
				this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
				this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);
				this.onPadButtonBlur_ = this.onPadButtonBlur_.bind(this);
				this.onPadButtonClick_ = this.onPadButtonClick_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.foldable_ = Foldable.create(config.expanded);
				this.popC_ =
					config.pickerLayout === 'popup'
						? new PopupController(doc, {
								viewProps: this.viewProps
						  })
						: null;
				const padC = new Point2dPickerController(doc, {
					baseSteps: [config.axes[0].baseStep, config.axes[1].baseStep],
					invertsY: config.invertsY,
					layout: config.pickerLayout,
					maxValue: config.maxValue,
					value: this.value,
					viewProps: this.viewProps
				});
				padC.view.allFocusableElements.forEach((elem) => {
					elem.addEventListener('blur', this.onPopupChildBlur_);
					elem.addEventListener('keydown', this.onPopupChildKeydown_);
				});
				this.pickerC_ = padC;
				this.textC_ = new PointNdTextController(doc, {
					assembly: Point2dAssembly,
					axes: config.axes,
					parser: config.parser,
					value: this.value,
					viewProps: this.viewProps
				});
				this.view = new Point2dView(doc, {
					expanded: this.foldable_.value('expanded'),
					pickerLayout: config.pickerLayout,
					viewProps: this.viewProps
				});
				this.view.textElement.appendChild(this.textC_.view.element);
				(_a = this.view.buttonElement) === null || _a === void 0
					? void 0
					: _a.addEventListener('blur', this.onPadButtonBlur_);
				(_b = this.view.buttonElement) === null || _b === void 0
					? void 0
					: _b.addEventListener('click', this.onPadButtonClick_);
				if (this.popC_) {
					this.view.element.appendChild(this.popC_.view.element);
					this.popC_.view.element.appendChild(this.pickerC_.view.element);
					connectValues({
						primary: this.foldable_.value('expanded'),
						secondary: this.popC_.shows,
						forward: (p) => p.rawValue,
						backward: (_, s) => s.rawValue
					});
				} else if (this.view.pickerElement) {
					this.view.pickerElement.appendChild(this.pickerC_.view.element);
					bindFoldable(this.foldable_, this.view.pickerElement);
				}
			}
			onPadButtonBlur_(e) {
				if (!this.popC_) {
					return;
				}
				const elem = this.view.element;
				const nextTarget = forceCast(e.relatedTarget);
				if (!nextTarget || !elem.contains(nextTarget)) {
					this.popC_.shows.rawValue = false;
				}
			}
			onPadButtonClick_() {
				this.foldable_.set('expanded', !this.foldable_.get('expanded'));
				if (this.foldable_.get('expanded')) {
					this.pickerC_.view.allFocusableElements[0].focus();
				}
			}
			onPopupChildBlur_(ev) {
				if (!this.popC_) {
					return;
				}
				const elem = this.popC_.view.element;
				const nextTarget = findNextTarget(ev);
				if (nextTarget && elem.contains(nextTarget)) {
					return;
				}
				if (
					nextTarget &&
					nextTarget === this.view.buttonElement &&
					!supportsTouch(elem.ownerDocument)
				) {
					return;
				}
				this.popC_.shows.rawValue = false;
			}
			onPopupChildKeydown_(ev) {
				if (this.popC_) {
					if (ev.key === 'Escape') {
						this.popC_.shows.rawValue = false;
					}
				} else if (this.view.pickerElement) {
					if (ev.key === 'Escape') {
						this.view.buttonElement.focus();
					}
				}
			}
		}

		function point2dFromUnknown(value) {
			return Point2d.isObject(value) ? new Point2d(value.x, value.y) : new Point2d();
		}
		function writePoint2d(target, value) {
			target.writeProperty('x', value.x);
			target.writeProperty('y', value.y);
		}

		function createDimensionConstraint$2(params) {
			if (!params) {
				return undefined;
			}
			const constraints = [];
			if (!isEmpty(params.step)) {
				constraints.push(new StepConstraint(params.step));
			}
			if (!isEmpty(params.max) || !isEmpty(params.min)) {
				constraints.push(
					new RangeConstraint({
						max: params.max,
						min: params.min
					})
				);
			}
			return new CompositeConstraint(constraints);
		}
		function createConstraint$3(params) {
			return new PointNdConstraint({
				assembly: Point2dAssembly,
				components: [
					createDimensionConstraint$2('x' in params ? params.x : undefined),
					createDimensionConstraint$2('y' in params ? params.y : undefined)
				]
			});
		}
		function getSuitableMaxDimensionValue(constraint, rawValue) {
			const rc = constraint && findConstraint(constraint, RangeConstraint);
			if (rc) {
				return Math.max(Math.abs(rc.minValue || 0), Math.abs(rc.maxValue || 0));
			}
			const step = getBaseStep(constraint);
			return Math.max(Math.abs(step) * 10, Math.abs(rawValue) * 10);
		}
		function getSuitableMaxValue(initialValue, constraint) {
			const xc = constraint instanceof PointNdConstraint ? constraint.components[0] : undefined;
			const yc = constraint instanceof PointNdConstraint ? constraint.components[1] : undefined;
			const xr = getSuitableMaxDimensionValue(xc, initialValue.x);
			const yr = getSuitableMaxDimensionValue(yc, initialValue.y);
			return Math.max(xr, yr);
		}
		function createAxis$2(initialValue, constraint) {
			return {
				baseStep: getBaseStep(constraint),
				constraint: constraint,
				textProps: ValueMap.fromObject({
					draggingScale: getSuitableDraggingScale(constraint, initialValue),
					formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue))
				})
			};
		}
		function shouldInvertY(params) {
			if (!('y' in params)) {
				return false;
			}
			const yParams = params.y;
			if (!yParams) {
				return false;
			}
			return 'inverted' in yParams ? !!yParams.inverted : false;
		}
		const Point2dInputPlugin = {
			id: 'input-point2d',
			type: 'input',
			accept: (value, params) => {
				if (!Point2d.isObject(value)) {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					expanded: p.optional.boolean,
					picker: p.optional.custom(parsePickerLayout),
					x: p.optional.custom(parsePointDimensionParams),
					y: p.optional.object({
						inverted: p.optional.boolean,
						max: p.optional.number,
						min: p.optional.number,
						step: p.optional.number
					})
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => point2dFromUnknown,
				constraint: (args) => createConstraint$3(args.params),
				equals: Point2d.equals,
				writer: (_args) => writePoint2d
			},
			controller: (args) => {
				const doc = args.document;
				const value = args.value;
				const c = args.constraint;
				if (!(c instanceof PointNdConstraint)) {
					throw TpError.shouldNeverHappen();
				}
				const expanded = 'expanded' in args.params ? args.params.expanded : undefined;
				const picker = 'picker' in args.params ? args.params.picker : undefined;
				return new Point2dController(doc, {
					axes: [
						createAxis$2(value.rawValue.x, c.components[0]),
						createAxis$2(value.rawValue.y, c.components[1])
					],
					expanded: expanded !== null && expanded !== void 0 ? expanded : false,
					invertsY: shouldInvertY(args.params),
					maxValue: getSuitableMaxValue(value.rawValue, c),
					parser: parseNumber,
					pickerLayout: picker !== null && picker !== void 0 ? picker : 'popup',
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		class Point3d {
			constructor(x = 0, y = 0, z = 0) {
				this.x = x;
				this.y = y;
				this.z = z;
			}
			getComponents() {
				return [this.x, this.y, this.z];
			}
			static isObject(obj) {
				if (isEmpty(obj)) {
					return false;
				}
				const x = obj.x;
				const y = obj.y;
				const z = obj.z;
				if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
					return false;
				}
				return true;
			}
			static equals(v1, v2) {
				return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
			}
			toObject() {
				return {
					x: this.x,
					y: this.y,
					z: this.z
				};
			}
		}
		const Point3dAssembly = {
			toComponents: (p) => p.getComponents(),
			fromComponents: (comps) => new Point3d(...comps)
		};

		function point3dFromUnknown(value) {
			return Point3d.isObject(value) ? new Point3d(value.x, value.y, value.z) : new Point3d();
		}
		function writePoint3d(target, value) {
			target.writeProperty('x', value.x);
			target.writeProperty('y', value.y);
			target.writeProperty('z', value.z);
		}

		function createDimensionConstraint$1(params) {
			if (!params) {
				return undefined;
			}
			const constraints = [];
			if (!isEmpty(params.step)) {
				constraints.push(new StepConstraint(params.step));
			}
			if (!isEmpty(params.max) || !isEmpty(params.min)) {
				constraints.push(
					new RangeConstraint({
						max: params.max,
						min: params.min
					})
				);
			}
			return new CompositeConstraint(constraints);
		}
		function createConstraint$2(params) {
			return new PointNdConstraint({
				assembly: Point3dAssembly,
				components: [
					createDimensionConstraint$1('x' in params ? params.x : undefined),
					createDimensionConstraint$1('y' in params ? params.y : undefined),
					createDimensionConstraint$1('z' in params ? params.z : undefined)
				]
			});
		}
		function createAxis$1(initialValue, constraint) {
			return {
				baseStep: getBaseStep(constraint),
				constraint: constraint,
				textProps: ValueMap.fromObject({
					draggingScale: getSuitableDraggingScale(constraint, initialValue),
					formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue))
				})
			};
		}
		const Point3dInputPlugin = {
			id: 'input-point3d',
			type: 'input',
			accept: (value, params) => {
				if (!Point3d.isObject(value)) {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					x: p.optional.custom(parsePointDimensionParams),
					y: p.optional.custom(parsePointDimensionParams),
					z: p.optional.custom(parsePointDimensionParams)
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => point3dFromUnknown,
				constraint: (args) => createConstraint$2(args.params),
				equals: Point3d.equals,
				writer: (_args) => writePoint3d
			},
			controller: (args) => {
				const value = args.value;
				const c = args.constraint;
				if (!(c instanceof PointNdConstraint)) {
					throw TpError.shouldNeverHappen();
				}
				return new PointNdTextController(args.document, {
					assembly: Point3dAssembly,
					axes: [
						createAxis$1(value.rawValue.x, c.components[0]),
						createAxis$1(value.rawValue.y, c.components[1]),
						createAxis$1(value.rawValue.z, c.components[2])
					],
					parser: parseNumber,
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		class Point4d {
			constructor(x = 0, y = 0, z = 0, w = 0) {
				this.x = x;
				this.y = y;
				this.z = z;
				this.w = w;
			}
			getComponents() {
				return [this.x, this.y, this.z, this.w];
			}
			static isObject(obj) {
				if (isEmpty(obj)) {
					return false;
				}
				const x = obj.x;
				const y = obj.y;
				const z = obj.z;
				const w = obj.w;
				if (
					typeof x !== 'number' ||
					typeof y !== 'number' ||
					typeof z !== 'number' ||
					typeof w !== 'number'
				) {
					return false;
				}
				return true;
			}
			static equals(v1, v2) {
				return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z && v1.w === v2.w;
			}
			toObject() {
				return {
					x: this.x,
					y: this.y,
					z: this.z,
					w: this.w
				};
			}
		}
		const Point4dAssembly = {
			toComponents: (p) => p.getComponents(),
			fromComponents: (comps) => new Point4d(...comps)
		};

		function point4dFromUnknown(value) {
			return Point4d.isObject(value)
				? new Point4d(value.x, value.y, value.z, value.w)
				: new Point4d();
		}
		function writePoint4d(target, value) {
			target.writeProperty('x', value.x);
			target.writeProperty('y', value.y);
			target.writeProperty('z', value.z);
			target.writeProperty('w', value.w);
		}

		function createDimensionConstraint(params) {
			if (!params) {
				return undefined;
			}
			const constraints = [];
			if (!isEmpty(params.step)) {
				constraints.push(new StepConstraint(params.step));
			}
			if (!isEmpty(params.max) || !isEmpty(params.min)) {
				constraints.push(
					new RangeConstraint({
						max: params.max,
						min: params.min
					})
				);
			}
			return new CompositeConstraint(constraints);
		}
		function createConstraint$1(params) {
			return new PointNdConstraint({
				assembly: Point4dAssembly,
				components: [
					createDimensionConstraint('x' in params ? params.x : undefined),
					createDimensionConstraint('y' in params ? params.y : undefined),
					createDimensionConstraint('z' in params ? params.z : undefined),
					createDimensionConstraint('w' in params ? params.w : undefined)
				]
			});
		}
		function createAxis(initialValue, constraint) {
			return {
				baseStep: getBaseStep(constraint),
				constraint: constraint,
				textProps: ValueMap.fromObject({
					draggingScale: getSuitableDraggingScale(constraint, initialValue),
					formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue))
				})
			};
		}
		const Point4dInputPlugin = {
			id: 'input-point4d',
			type: 'input',
			accept: (value, params) => {
				if (!Point4d.isObject(value)) {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					x: p.optional.custom(parsePointDimensionParams),
					y: p.optional.custom(parsePointDimensionParams),
					z: p.optional.custom(parsePointDimensionParams),
					w: p.optional.custom(parsePointDimensionParams)
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => point4dFromUnknown,
				constraint: (args) => createConstraint$1(args.params),
				equals: Point4d.equals,
				writer: (_args) => writePoint4d
			},
			controller: (args) => {
				const value = args.value;
				const c = args.constraint;
				if (!(c instanceof PointNdConstraint)) {
					throw TpError.shouldNeverHappen();
				}
				return new PointNdTextController(args.document, {
					assembly: Point4dAssembly,
					axes: value.rawValue
						.getComponents()
						.map((comp, index) => createAxis(comp, c.components[index])),
					parser: parseNumber,
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		function createConstraint(params) {
			const constraints = [];
			const lc = createListConstraint(params.options);
			if (lc) {
				constraints.push(lc);
			}
			return new CompositeConstraint(constraints);
		}
		const StringInputPlugin = {
			id: 'input-string',
			type: 'input',
			accept: (value, params) => {
				if (typeof value !== 'string') {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					options: p.optional.custom(parseListOptions)
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => stringFromUnknown,
				constraint: (args) => createConstraint(args.params),
				writer: (_args) => writePrimitive
			},
			controller: (args) => {
				var _a;
				const doc = args.document;
				const value = args.value;
				const c = args.constraint;
				if (c && findConstraint(c, ListConstraint)) {
					return new ListController(doc, {
						props: ValueMap.fromObject({
							options: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : []
						}),
						value: value,
						viewProps: args.viewProps
					});
				}
				return new TextController(doc, {
					parser: (v) => v,
					props: ValueMap.fromObject({
						formatter: formatString
					}),
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		const Constants = {
			monitor: {
				defaultInterval: 200,
				defaultLineCount: 3
			}
		};

		const className$2 = ClassName('mll');
		class MultiLogView {
			constructor(doc, config) {
				this.onValueUpdate_ = this.onValueUpdate_.bind(this);
				this.formatter_ = config.formatter;
				this.element = doc.createElement('div');
				this.element.classList.add(className$2());
				config.viewProps.bindClassModifiers(this.element);
				const textareaElem = doc.createElement('textarea');
				textareaElem.classList.add(className$2('i'));
				textareaElem.style.height = `calc(var(--bld-us) * ${config.lineCount})`;
				textareaElem.readOnly = true;
				config.viewProps.bindDisabled(textareaElem);
				this.element.appendChild(textareaElem);
				this.textareaElem_ = textareaElem;
				config.value.emitter.on('change', this.onValueUpdate_);
				this.value = config.value;
				this.update_();
			}
			update_() {
				const elem = this.textareaElem_;
				const shouldScroll = elem.scrollTop === elem.scrollHeight - elem.clientHeight;
				const lines = [];
				this.value.rawValue.forEach((value) => {
					if (value !== undefined) {
						lines.push(this.formatter_(value));
					}
				});
				elem.textContent = lines.join('\n');
				if (shouldScroll) {
					elem.scrollTop = elem.scrollHeight;
				}
			}
			onValueUpdate_() {
				this.update_();
			}
		}

		class MultiLogController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new MultiLogView(doc, {
					formatter: config.formatter,
					lineCount: config.lineCount,
					value: this.value,
					viewProps: this.viewProps
				});
			}
		}

		const className$1 = ClassName('sgl');
		class SingleLogView {
			constructor(doc, config) {
				this.onValueUpdate_ = this.onValueUpdate_.bind(this);
				this.formatter_ = config.formatter;
				this.element = doc.createElement('div');
				this.element.classList.add(className$1());
				config.viewProps.bindClassModifiers(this.element);
				const inputElem = doc.createElement('input');
				inputElem.classList.add(className$1('i'));
				inputElem.readOnly = true;
				inputElem.type = 'text';
				config.viewProps.bindDisabled(inputElem);
				this.element.appendChild(inputElem);
				this.inputElement = inputElem;
				config.value.emitter.on('change', this.onValueUpdate_);
				this.value = config.value;
				this.update_();
			}
			update_() {
				const values = this.value.rawValue;
				const lastValue = values[values.length - 1];
				this.inputElement.value = lastValue !== undefined ? this.formatter_(lastValue) : '';
			}
			onValueUpdate_() {
				this.update_();
			}
		}

		class SingleLogController {
			constructor(doc, config) {
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.view = new SingleLogView(doc, {
					formatter: config.formatter,
					value: this.value,
					viewProps: this.viewProps
				});
			}
		}

		const BooleanMonitorPlugin = {
			id: 'monitor-bool',
			type: 'monitor',
			accept: (value, params) => {
				if (typeof value !== 'boolean') {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					lineCount: p.optional.number
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => boolFromUnknown
			},
			controller: (args) => {
				var _a;
				if (args.value.rawValue.length === 1) {
					return new SingleLogController(args.document, {
						formatter: BooleanFormatter,
						value: args.value,
						viewProps: args.viewProps
					});
				}
				return new MultiLogController(args.document, {
					formatter: BooleanFormatter,
					lineCount:
						(_a = args.params.lineCount) !== null && _a !== void 0
							? _a
							: Constants.monitor.defaultLineCount,
					value: args.value,
					viewProps: args.viewProps
				});
			}
		};

		class GraphCursor {
			constructor() {
				this.emitter = new Emitter();
				this.index_ = -1;
			}
			get index() {
				return this.index_;
			}
			set index(index) {
				const changed = this.index_ !== index;
				if (changed) {
					this.index_ = index;
					this.emitter.emit('change', {
						index: index,
						sender: this
					});
				}
			}
		}

		const className = ClassName('grl');
		class GraphLogView {
			constructor(doc, config) {
				this.onCursorChange_ = this.onCursorChange_.bind(this);
				this.onValueUpdate_ = this.onValueUpdate_.bind(this);
				this.element = doc.createElement('div');
				this.element.classList.add(className());
				config.viewProps.bindClassModifiers(this.element);
				this.formatter_ = config.formatter;
				this.minValue_ = config.minValue;
				this.maxValue_ = config.maxValue;
				this.cursor_ = config.cursor;
				this.cursor_.emitter.on('change', this.onCursorChange_);
				const svgElem = doc.createElementNS(SVG_NS, 'svg');
				svgElem.classList.add(className('g'));
				svgElem.style.height = `calc(var(--bld-us) * ${config.lineCount})`;
				this.element.appendChild(svgElem);
				this.svgElem_ = svgElem;
				const lineElem = doc.createElementNS(SVG_NS, 'polyline');
				this.svgElem_.appendChild(lineElem);
				this.lineElem_ = lineElem;
				const tooltipElem = doc.createElement('div');
				tooltipElem.classList.add(className('t'), ClassName('tt')());
				this.element.appendChild(tooltipElem);
				this.tooltipElem_ = tooltipElem;
				config.value.emitter.on('change', this.onValueUpdate_);
				this.value = config.value;
				this.update_();
			}
			get graphElement() {
				return this.svgElem_;
			}
			update_() {
				const bounds = this.svgElem_.getBoundingClientRect();
				const maxIndex = this.value.rawValue.length - 1;
				const min = this.minValue_;
				const max = this.maxValue_;
				const points = [];
				this.value.rawValue.forEach((v, index) => {
					if (v === undefined) {
						return;
					}
					const x = mapRange(index, 0, maxIndex, 0, bounds.width);
					const y = mapRange(v, min, max, bounds.height, 0);
					points.push([x, y].join(','));
				});
				this.lineElem_.setAttributeNS(null, 'points', points.join(' '));
				const tooltipElem = this.tooltipElem_;
				const value = this.value.rawValue[this.cursor_.index];
				if (value === undefined) {
					tooltipElem.classList.remove(className('t', 'a'));
					return;
				}
				const tx = mapRange(this.cursor_.index, 0, maxIndex, 0, bounds.width);
				const ty = mapRange(value, min, max, bounds.height, 0);
				tooltipElem.style.left = `${tx}px`;
				tooltipElem.style.top = `${ty}px`;
				tooltipElem.textContent = `${this.formatter_(value)}`;
				if (!tooltipElem.classList.contains(className('t', 'a'))) {
					tooltipElem.classList.add(className('t', 'a'), className('t', 'in'));
					forceReflow(tooltipElem);
					tooltipElem.classList.remove(className('t', 'in'));
				}
			}
			onValueUpdate_() {
				this.update_();
			}
			onCursorChange_() {
				this.update_();
			}
		}

		class GraphLogController {
			constructor(doc, config) {
				this.onGraphMouseMove_ = this.onGraphMouseMove_.bind(this);
				this.onGraphMouseLeave_ = this.onGraphMouseLeave_.bind(this);
				this.onGraphPointerDown_ = this.onGraphPointerDown_.bind(this);
				this.onGraphPointerMove_ = this.onGraphPointerMove_.bind(this);
				this.onGraphPointerUp_ = this.onGraphPointerUp_.bind(this);
				this.value = config.value;
				this.viewProps = config.viewProps;
				this.cursor_ = new GraphCursor();
				this.view = new GraphLogView(doc, {
					cursor: this.cursor_,
					formatter: config.formatter,
					lineCount: config.lineCount,
					maxValue: config.maxValue,
					minValue: config.minValue,
					value: this.value,
					viewProps: this.viewProps
				});
				if (!supportsTouch(doc)) {
					this.view.element.addEventListener('mousemove', this.onGraphMouseMove_);
					this.view.element.addEventListener('mouseleave', this.onGraphMouseLeave_);
				} else {
					const ph = new PointerHandler(this.view.element);
					ph.emitter.on('down', this.onGraphPointerDown_);
					ph.emitter.on('move', this.onGraphPointerMove_);
					ph.emitter.on('up', this.onGraphPointerUp_);
				}
			}
			onGraphMouseLeave_() {
				this.cursor_.index = -1;
			}
			onGraphMouseMove_(ev) {
				const bounds = this.view.element.getBoundingClientRect();
				this.cursor_.index = Math.floor(
					mapRange(ev.offsetX, 0, bounds.width, 0, this.value.rawValue.length)
				);
			}
			onGraphPointerDown_(ev) {
				this.onGraphPointerMove_(ev);
			}
			onGraphPointerMove_(ev) {
				if (!ev.data.point) {
					this.cursor_.index = -1;
					return;
				}
				this.cursor_.index = Math.floor(
					mapRange(ev.data.point.x, 0, ev.data.bounds.width, 0, this.value.rawValue.length)
				);
			}
			onGraphPointerUp_() {
				this.cursor_.index = -1;
			}
		}

		function createFormatter(params) {
			return 'format' in params && !isEmpty(params.format)
				? params.format
				: createNumberFormatter(2);
		}
		function createTextMonitor(args) {
			var _a;
			if (args.value.rawValue.length === 1) {
				return new SingleLogController(args.document, {
					formatter: createFormatter(args.params),
					value: args.value,
					viewProps: args.viewProps
				});
			}
			return new MultiLogController(args.document, {
				formatter: createFormatter(args.params),
				lineCount:
					(_a = args.params.lineCount) !== null && _a !== void 0
						? _a
						: Constants.monitor.defaultLineCount,
				value: args.value,
				viewProps: args.viewProps
			});
		}
		function createGraphMonitor(args) {
			var _a, _b, _c;
			return new GraphLogController(args.document, {
				formatter: createFormatter(args.params),
				lineCount:
					(_a = args.params.lineCount) !== null && _a !== void 0
						? _a
						: Constants.monitor.defaultLineCount,
				maxValue:
					(_b = 'max' in args.params ? args.params.max : null) !== null && _b !== void 0 ? _b : 100,
				minValue:
					(_c = 'min' in args.params ? args.params.min : null) !== null && _c !== void 0 ? _c : 0,
				value: args.value,
				viewProps: args.viewProps
			});
		}
		function shouldShowGraph(params) {
			return 'view' in params && params.view === 'graph';
		}
		const NumberMonitorPlugin = {
			id: 'monitor-number',
			type: 'monitor',
			accept: (value, params) => {
				if (typeof value !== 'number') {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					format: p.optional.function,
					lineCount: p.optional.number,
					max: p.optional.number,
					min: p.optional.number,
					view: p.optional.string
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				defaultBufferSize: (params) => (shouldShowGraph(params) ? 64 : 1),
				reader: (_args) => numberFromUnknown
			},
			controller: (args) => {
				if (shouldShowGraph(args.params)) {
					return createGraphMonitor(args);
				}
				return createTextMonitor(args);
			}
		};

		const StringMonitorPlugin = {
			id: 'monitor-string',
			type: 'monitor',
			accept: (value, params) => {
				if (typeof value !== 'string') {
					return null;
				}
				const p = ParamsParsers;
				const result = parseParams(params, {
					lineCount: p.optional.number,
					multiline: p.optional.boolean
				});
				return result
					? {
							initialValue: value,
							params: result
					  }
					: null;
			},
			binding: {
				reader: (_args) => stringFromUnknown
			},
			controller: (args) => {
				var _a;
				const value = args.value;
				const multiline =
					value.rawValue.length > 1 || ('multiline' in args.params && args.params.multiline);
				if (multiline) {
					return new MultiLogController(args.document, {
						formatter: formatString,
						lineCount:
							(_a = args.params.lineCount) !== null && _a !== void 0
								? _a
								: Constants.monitor.defaultLineCount,
						value: value,
						viewProps: args.viewProps
					});
				}
				return new SingleLogController(args.document, {
					formatter: formatString,
					value: value,
					viewProps: args.viewProps
				});
			}
		};

		class InputBinding {
			constructor(config) {
				this.onValueChange_ = this.onValueChange_.bind(this);
				this.reader = config.reader;
				this.writer = config.writer;
				this.emitter = new Emitter();
				this.value = config.value;
				this.value.emitter.on('change', this.onValueChange_);
				this.target = config.target;
				this.read();
			}
			read() {
				const targetValue = this.target.read();
				if (targetValue !== undefined) {
					this.value.rawValue = this.reader(targetValue);
				}
			}
			write_(rawValue) {
				this.writer(this.target, rawValue);
			}
			onValueChange_(ev) {
				this.write_(ev.rawValue);
				this.emitter.emit('change', {
					options: ev.options,
					rawValue: ev.rawValue,
					sender: this
				});
			}
		}

		function createInputBindingController(plugin, args) {
			const result = plugin.accept(args.target.read(), args.params);
			if (isEmpty(result)) {
				return null;
			}
			const p = ParamsParsers;
			const valueArgs = {
				target: args.target,
				initialValue: result.initialValue,
				params: result.params
			};
			const reader = plugin.binding.reader(valueArgs);
			const constraint = plugin.binding.constraint
				? plugin.binding.constraint(valueArgs)
				: undefined;
			const value = createValue(reader(result.initialValue), {
				constraint: constraint,
				equals: plugin.binding.equals
			});
			const binding = new InputBinding({
				reader: reader,
				target: args.target,
				value: value,
				writer: plugin.binding.writer(valueArgs)
			});
			const disabled = p.optional.boolean(args.params.disabled).value;
			const hidden = p.optional.boolean(args.params.hidden).value;
			const controller = plugin.controller({
				constraint: constraint,
				document: args.document,
				initialValue: result.initialValue,
				params: result.params,
				value: binding.value,
				viewProps: ViewProps.create({
					disabled: disabled,
					hidden: hidden
				})
			});
			const label = p.optional.string(args.params.label).value;
			return new InputBindingController(args.document, {
				binding: binding,
				blade: createBlade(),
				props: ValueMap.fromObject({
					label: label || args.target.key
				}),
				valueController: controller
			});
		}

		class MonitorBinding {
			constructor(config) {
				this.onTick_ = this.onTick_.bind(this);
				this.reader_ = config.reader;
				this.target = config.target;
				this.emitter = new Emitter();
				this.value = config.value;
				this.ticker = config.ticker;
				this.ticker.emitter.on('tick', this.onTick_);
				this.read();
			}
			dispose() {
				this.ticker.dispose();
			}
			read() {
				const targetValue = this.target.read();
				if (targetValue === undefined) {
					return;
				}
				const buffer = this.value.rawValue;
				const newValue = this.reader_(targetValue);
				this.value.rawValue = createPushedBuffer(buffer, newValue);
				this.emitter.emit('update', {
					rawValue: newValue,
					sender: this
				});
			}
			onTick_(_) {
				this.read();
			}
		}

		function createTicker(document, interval) {
			return interval === 0
				? new ManualTicker()
				: new IntervalTicker(
						document,
						interval !== null && interval !== void 0 ? interval : Constants.monitor.defaultInterval
				  );
		}
		function createMonitorBindingController(plugin, args) {
			var _a, _b, _c;
			const P = ParamsParsers;
			const result = plugin.accept(args.target.read(), args.params);
			if (isEmpty(result)) {
				return null;
			}
			const bindingArgs = {
				target: args.target,
				initialValue: result.initialValue,
				params: result.params
			};
			const reader = plugin.binding.reader(bindingArgs);
			const bufferSize =
				(_b =
					(_a = P.optional.number(args.params.bufferSize).value) !== null && _a !== void 0
						? _a
						: plugin.binding.defaultBufferSize &&
						  plugin.binding.defaultBufferSize(result.params)) !== null && _b !== void 0
					? _b
					: 1;
			const interval = P.optional.number(args.params.interval).value;
			const binding = new MonitorBinding({
				reader: reader,
				target: args.target,
				ticker: createTicker(args.document, interval),
				value: initializeBuffer(bufferSize)
			});
			const disabled = P.optional.boolean(args.params.disabled).value;
			const hidden = P.optional.boolean(args.params.hidden).value;
			const controller = plugin.controller({
				document: args.document,
				params: result.params,
				value: binding.value,
				viewProps: ViewProps.create({
					disabled: disabled,
					hidden: hidden
				})
			});
			const label =
				(_c = P.optional.string(args.params.label).value) !== null && _c !== void 0
					? _c
					: args.target.key;
			return new MonitorBindingController(args.document, {
				binding: binding,
				blade: createBlade(),
				props: ValueMap.fromObject({
					label: label
				}),
				valueController: controller
			});
		}

		class PluginPool {
			constructor() {
				this.pluginsMap_ = {
					blades: [],
					inputs: [],
					monitors: []
				};
			}
			getAll() {
				return [
					...this.pluginsMap_.blades,
					...this.pluginsMap_.inputs,
					...this.pluginsMap_.monitors
				];
			}
			register(r) {
				if (r.type === 'blade') {
					this.pluginsMap_.blades.unshift(r);
				} else if (r.type === 'input') {
					this.pluginsMap_.inputs.unshift(r);
				} else if (r.type === 'monitor') {
					this.pluginsMap_.monitors.unshift(r);
				}
			}
			createInput(document, target, params) {
				const initialValue = target.read();
				if (isEmpty(initialValue)) {
					throw new TpError({
						context: {
							key: target.key
						},
						type: 'nomatchingcontroller'
					});
				}
				const bc = this.pluginsMap_.inputs.reduce(
					(result, plugin) =>
						result ||
						createInputBindingController(plugin, {
							document: document,
							target: target,
							params: params
						}),
					null
				);
				if (bc) {
					return bc;
				}
				throw new TpError({
					context: {
						key: target.key
					},
					type: 'nomatchingcontroller'
				});
			}
			createMonitor(document, target, params) {
				const bc = this.pluginsMap_.monitors.reduce(
					(result, plugin) =>
						result ||
						createMonitorBindingController(plugin, {
							document: document,
							params: params,
							target: target
						}),
					null
				);
				if (bc) {
					return bc;
				}
				throw new TpError({
					context: {
						key: target.key
					},
					type: 'nomatchingcontroller'
				});
			}
			createBlade(document, params) {
				const bc = this.pluginsMap_.blades.reduce(
					(result, plugin) =>
						result ||
						createBladeController(plugin, {
							document: document,
							params: params
						}),
					null
				);
				if (!bc) {
					throw new TpError({
						type: 'nomatchingview',
						context: {
							params: params
						}
					});
				}
				return bc;
			}
			createBladeApi(bc) {
				if (bc instanceof InputBindingController) {
					return new InputBindingApi(bc);
				}
				if (bc instanceof MonitorBindingController) {
					return new MonitorBindingApi(bc);
				}
				if (bc instanceof RackController) {
					return new RackApi(bc, this);
				}
				const api = this.pluginsMap_.blades.reduce(
					(result, plugin) =>
						result ||
						plugin.api({
							controller: bc,
							pool: this
						}),
					null
				);
				if (!api) {
					throw TpError.shouldNeverHappen();
				}
				return api;
			}
		}

		function createDefaultPluginPool() {
			const pool = new PluginPool();
			[
				Point2dInputPlugin,
				Point3dInputPlugin,
				Point4dInputPlugin,
				StringInputPlugin,
				NumberInputPlugin,
				StringColorInputPlugin,
				ObjectColorInputPlugin,
				NumberColorInputPlugin,
				BooleanInputPlugin,
				BooleanMonitorPlugin,
				StringMonitorPlugin,
				NumberMonitorPlugin,
				ButtonBladePlugin,
				FolderBladePlugin,
				SeparatorBladePlugin,
				TabBladePlugin
			].forEach((p) => {
				pool.register(p);
			});
			return pool;
		}

		class ListApi extends BladeApi {
			constructor(controller) {
				super(controller);
				this.emitter_ = new Emitter();
				this.controller_.valueController.value.emitter.on('change', (ev) => {
					this.emitter_.emit('change', {
						event: new TpChangeEvent(this, ev.rawValue)
					});
				});
			}
			get label() {
				return this.controller_.props.get('label');
			}
			set label(label) {
				this.controller_.props.set('label', label);
			}
			get options() {
				return this.controller_.valueController.props.get('options');
			}
			set options(options) {
				this.controller_.valueController.props.set('options', options);
			}
			get value() {
				return this.controller_.valueController.value.rawValue;
			}
			set value(value) {
				this.controller_.valueController.value.rawValue = value;
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
		}

		class SliderApi extends BladeApi {
			constructor(controller) {
				super(controller);
				this.emitter_ = new Emitter();
				this.controller_.valueController.value.emitter.on('change', (ev) => {
					this.emitter_.emit('change', {
						event: new TpChangeEvent(this, ev.rawValue)
					});
				});
			}
			get label() {
				return this.controller_.props.get('label');
			}
			set label(label) {
				this.controller_.props.set('label', label);
			}
			get maxValue() {
				return this.controller_.valueController.sliderController.props.get('maxValue');
			}
			set maxValue(maxValue) {
				this.controller_.valueController.sliderController.props.set('maxValue', maxValue);
			}
			get minValue() {
				return this.controller_.valueController.sliderController.props.get('minValue');
			}
			set minValue(minValue) {
				this.controller_.valueController.sliderController.props.set('minValue', minValue);
			}
			get value() {
				return this.controller_.valueController.value.rawValue;
			}
			set value(value) {
				this.controller_.valueController.value.rawValue = value;
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
		}

		class TextApi extends BladeApi {
			constructor(controller) {
				super(controller);
				this.emitter_ = new Emitter();
				this.controller_.valueController.value.emitter.on('change', (ev) => {
					this.emitter_.emit('change', {
						event: new TpChangeEvent(this, ev.rawValue)
					});
				});
			}
			get label() {
				return this.controller_.props.get('label');
			}
			set label(label) {
				this.controller_.props.set('label', label);
			}
			get formatter() {
				return this.controller_.valueController.props.get('formatter');
			}
			set formatter(formatter) {
				this.controller_.valueController.props.set('formatter', formatter);
			}
			get value() {
				return this.controller_.valueController.value.rawValue;
			}
			set value(value) {
				this.controller_.valueController.value.rawValue = value;
			}
			on(eventName, handler) {
				const bh = handler.bind(this);
				this.emitter_.on(eventName, (ev) => {
					bh(ev.event);
				});
				return this;
			}
		}

		const ListBladePlugin = (function () {
			return {
				id: 'list',
				type: 'blade',
				accept(params) {
					const p = ParamsParsers;
					const result = parseParams(params, {
						options: p.required.custom(parseListOptions),
						value: p.required.raw,
						view: p.required.constant('list'),
						label: p.optional.string
					});
					return result ? { params: result } : null;
				},
				controller(args) {
					const ic = new ListController(args.document, {
						props: ValueMap.fromObject({
							options: normalizeListOptions(args.params.options)
						}),
						value: createValue(args.params.value),
						viewProps: args.viewProps
					});
					return new LabeledValueController(args.document, {
						blade: args.blade,
						props: ValueMap.fromObject({
							label: args.params.label
						}),
						valueController: ic
					});
				},
				api(args) {
					if (!(args.controller instanceof LabeledValueController)) {
						return null;
					}
					if (!(args.controller.valueController instanceof ListController)) {
						return null;
					}
					return new ListApi(args.controller);
				}
			};
		})();

		/**
		 * @hidden
		 */
		function exportPresetJson(targets) {
			return targets.reduce((result, target) => {
				return Object.assign(result, {
					[target.presetKey]: target.read()
				});
			}, {});
		}
		/**
		 * @hidden
		 */
		function importPresetJson(targets, preset) {
			targets.forEach((target) => {
				const value = preset[target.presetKey];
				if (value !== undefined) {
					target.write(value);
				}
			});
		}

		class RootApi extends FolderApi {
			/**
			 * @hidden
			 */
			constructor(controller, pool) {
				super(controller, pool);
			}
			get element() {
				return this.controller_.view.element;
			}
			/**
			 * Imports a preset of all inputs.
			 * @param preset The preset object to import.
			 */
			importPreset(preset) {
				const targets = this.controller_.rackController.rack
					.find(InputBindingController)
					.map((ibc) => {
						return ibc.binding.target;
					});
				importPresetJson(targets, preset);
				this.refresh();
			}
			/**
			 * Exports a preset of all inputs.
			 * @return An exported preset object.
			 */
			exportPreset() {
				const targets = this.controller_.rackController.rack
					.find(InputBindingController)
					.map((ibc) => {
						return ibc.binding.target;
					});
				return exportPresetJson(targets);
			}
			/**
			 * Refreshes all bindings of the pane.
			 */
			refresh() {
				// Force-read all input bindings
				this.controller_.rackController.rack.find(InputBindingController).forEach((ibc) => {
					ibc.binding.read();
				});
				// Force-read all monitor bindings
				this.controller_.rackController.rack.find(MonitorBindingController).forEach((mbc) => {
					mbc.binding.read();
				});
			}
		}

		class RootController extends FolderController {
			constructor(doc, config) {
				super(doc, {
					expanded: config.expanded,
					blade: config.blade,
					props: config.props,
					root: true,
					viewProps: config.viewProps
				});
			}
		}

		const SliderBladePlugin = {
			id: 'slider',
			type: 'blade',
			accept(params) {
				const p = ParamsParsers;
				const result = parseParams(params, {
					max: p.required.number,
					min: p.required.number,
					view: p.required.constant('slider'),
					format: p.optional.function,
					label: p.optional.string,
					value: p.optional.number
				});
				return result ? { params: result } : null;
			},
			controller(args) {
				var _a, _b;
				const v = (_a = args.params.value) !== null && _a !== void 0 ? _a : 0;
				const vc = new SliderTextController(args.document, {
					baseStep: 1,
					parser: parseNumber,
					sliderProps: ValueMap.fromObject({
						maxValue: args.params.max,
						minValue: args.params.min
					}),
					textProps: ValueMap.fromObject({
						draggingScale: getSuitableDraggingScale(undefined, v),
						formatter: (_b = args.params.format) !== null && _b !== void 0 ? _b : numberToString
					}),
					value: createValue(v),
					viewProps: args.viewProps
				});
				return new LabeledValueController(args.document, {
					blade: args.blade,
					props: ValueMap.fromObject({
						label: args.params.label
					}),
					valueController: vc
				});
			},
			api(args) {
				if (!(args.controller instanceof LabeledValueController)) {
					return null;
				}
				if (!(args.controller.valueController instanceof SliderTextController)) {
					return null;
				}
				return new SliderApi(args.controller);
			}
		};

		const TextBladePlugin = (function () {
			return {
				id: 'text',
				type: 'blade',
				accept(params) {
					const p = ParamsParsers;
					const result = parseParams(params, {
						parse: p.required.function,
						value: p.required.raw,
						view: p.required.constant('text'),
						format: p.optional.function,
						label: p.optional.string
					});
					return result ? { params: result } : null;
				},
				controller(args) {
					var _a;
					const ic = new TextController(args.document, {
						parser: args.params.parse,
						props: ValueMap.fromObject({
							formatter: (_a = args.params.format) !== null && _a !== void 0 ? _a : (v) => String(v)
						}),
						value: createValue(args.params.value),
						viewProps: args.viewProps
					});
					return new LabeledValueController(args.document, {
						blade: args.blade,
						props: ValueMap.fromObject({
							label: args.params.label
						}),
						valueController: ic
					});
				},
				api(args) {
					if (!(args.controller instanceof LabeledValueController)) {
						return null;
					}
					if (!(args.controller.valueController instanceof TextController)) {
						return null;
					}
					return new TextApi(args.controller);
				}
			};
		})();

		function createDefaultWrapperElement(doc) {
			const elem = doc.createElement('div');
			elem.classList.add(ClassName('dfw')());
			if (doc.body) {
				doc.body.appendChild(elem);
			}
			return elem;
		}
		function embedStyle(doc, id, css) {
			if (doc.querySelector(`style[data-tp-style=${id}]`)) {
				return;
			}
			const styleElem = doc.createElement('style');
			styleElem.dataset.tpStyle = id;
			styleElem.textContent = css;
			doc.head.appendChild(styleElem);
		}
		/**
		 * The root pane of Tweakpane.
		 */
		class Pane extends RootApi {
			constructor(opt_config) {
				var _a;
				const config = opt_config || {};
				const doc = (_a = config.document) !== null && _a !== void 0 ? _a : getWindowDocument();
				const pool = createDefaultPluginPool();
				const rootController = new RootController(doc, {
					expanded: config.expanded,
					blade: createBlade(),
					props: ValueMap.fromObject({
						title: config.title
					}),
					viewProps: ViewProps.create()
				});
				super(rootController, pool);
				this.pool_ = pool;
				this.containerElem_ = config.container || createDefaultWrapperElement(doc);
				this.containerElem_.appendChild(this.element);
				this.doc_ = doc;
				this.usesDefaultWrapper_ = !config.container;
				this.setUpDefaultPlugins_();
			}
			get document() {
				if (!this.doc_) {
					throw TpError.alreadyDisposed();
				}
				return this.doc_;
			}
			dispose() {
				const containerElem = this.containerElem_;
				if (!containerElem) {
					throw TpError.alreadyDisposed();
				}
				if (this.usesDefaultWrapper_) {
					const parentElem = containerElem.parentElement;
					if (parentElem) {
						parentElem.removeChild(containerElem);
					}
				}
				this.containerElem_ = null;
				this.doc_ = null;
				super.dispose();
			}
			registerPlugin(bundle) {
				const plugins =
					'plugin' in bundle ? [bundle.plugin] : 'plugins' in bundle ? bundle.plugins : [];
				plugins.forEach((p) => {
					this.pool_.register(p);
					this.embedPluginStyle_(p);
				});
			}
			embedPluginStyle_(plugin) {
				if (plugin.css) {
					embedStyle(this.document, `plugin-${plugin.id}`, plugin.css);
				}
			}
			setUpDefaultPlugins_() {
				// NOTE: This string literal will be replaced with the default CSS by Rollup at the compilation time
				embedStyle(
					this.document,
					'default',
					".tp-lstv_s,.tp-btnv_b,.tp-p2dv_b,.tp-colswv_sw,.tp-p2dpv_p,.tp-txtv_i,.tp-grlv_g,.tp-sglv_i,.tp-mllv_i,.tp-fldv_b,.tp-rotv_b,.tp-ckbv_i,.tp-coltxtv_ms,.tp-tbiv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-lstv_s,.tp-btnv_b,.tp-p2dv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-lstv_s:hover,.tp-btnv_b:hover,.tp-p2dv_b:hover{background-color:var(--btn-bg-h)}.tp-lstv_s:focus,.tp-btnv_b:focus,.tp-p2dv_b:focus{background-color:var(--btn-bg-f)}.tp-lstv_s:active,.tp-btnv_b:active,.tp-p2dv_b:active{background-color:var(--btn-bg-a)}.tp-lstv_s:disabled,.tp-btnv_b:disabled,.tp-p2dv_b:disabled{opacity:0.5}.tp-colswv_sw,.tp-p2dpv_p,.tp-txtv_i{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-colswv_sw:hover,.tp-p2dpv_p:hover,.tp-txtv_i:hover{background-color:var(--in-bg-h)}.tp-colswv_sw:focus,.tp-p2dpv_p:focus,.tp-txtv_i:focus{background-color:var(--in-bg-f)}.tp-colswv_sw:active,.tp-p2dpv_p:active,.tp-txtv_i:active{background-color:var(--in-bg-a)}.tp-colswv_sw:disabled,.tp-p2dpv_p:disabled,.tp-txtv_i:disabled{opacity:0.5}.tp-grlv_g,.tp-sglv_i,.tp-mllv_i{background-color:var(--mo-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--mo-fg);height:var(--bld-us);width:100%}.tp-rotv{--font-family: var(--tp-font-family, Roboto Mono,Source Code Pro,Menlo,Courier,monospace);--bs-br: var(--tp-base-border-radius, 6px);--cnt-h-p: var(--tp-container-horizontal-padding, 4px);--cnt-v-p: var(--tp-container-vertical-padding, 4px);--elm-br: var(--tp-element-border-radius, 2px);--bld-s: var(--tp-blade-spacing, 4px);--bld-us: var(--tp-blade-unit-size, 20px);--bs-bg: var(--tp-base-background-color, #2f3137);--bs-sh: var(--tp-base-shadow-color, rgba(0,0,0,0.2));--btn-bg: var(--tp-button-background-color, #adafb8);--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, #2f3137);--cnt-bg: var(--tp-container-background-color, rgba(187,188,196,0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187,188,196,0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187,188,196,0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187,188,196,0.15));--cnt-fg: var(--tp-container-foreground-color, #bbbcc4);--in-bg: var(--tp-input-background-color, rgba(0,0,0,0.2));--in-bg-a: var(--tp-input-background-color-active, rgba(0,0,0,0.35));--in-bg-f: var(--tp-input-background-color-focus, rgba(0,0,0,0.3));--in-bg-h: var(--tp-input-background-color-hover, rgba(0,0,0,0.25));--in-fg: var(--tp-input-foreground-color, #bbbcc4);--lbl-fg: var(--tp-label-foreground-color, rgba(187,188,196,0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0,0,0,0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187,188,196,0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(0,0,0,0.2))}.tp-fldv_c>.tp-cntv.tp-v-lst,.tp-tabv_c .tp-brkv>.tp-cntv.tp-v-lst,.tp-rotv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1 * var(--cnt-v-p))}.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-fldv_c>*:not(.tp-v-fst),.tp-tabv_c .tp-brkv>*:not(.tp-v-fst),.tp-rotv_c>*:not(.tp-v-fst){margin-top:var(--bld-s)}.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-v-p)}.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-cntv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-v-p)}.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-fldv_c>.tp-cntv,.tp-tabv_c .tp-brkv>.tp-cntv{margin-left:4px}.tp-fldv_c>.tp-fldv>.tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--elm-br);border-bottom-left-radius:var(--elm-br)}.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-fldv_c .tp-fldv>.tp-fldv_c,.tp-tabv_c .tp-brkv .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--elm-br)}.tp-fldv_c>.tp-tabv>.tp-tabv_i,.tp-tabv_c .tp-brkv>.tp-tabv>.tp-tabv_i{border-top-left-radius:var(--elm-br)}.tp-fldv_c .tp-tabv>.tp-tabv_c,.tp-tabv_c .tp-brkv .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--elm-br)}.tp-fldv_b,.tp-rotv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);overflow:hidden;padding-left:calc(var(--cnt-h-p) + 8px);padding-right:calc(2px * 2 + var(--bld-us) + var(--cnt-h-p));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-fldv_b:hover,.tp-rotv_b:hover{background-color:var(--cnt-bg-h)}.tp-fldv_b:focus,.tp-rotv_b:focus{background-color:var(--cnt-bg-f)}.tp-fldv_b:active,.tp-rotv_b:active{background-color:var(--cnt-bg-a)}.tp-fldv_b:disabled,.tp-rotv_b:disabled{opacity:0.5}.tp-fldv_m,.tp-rotv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:'';display:block;height:6px;right:calc(var(--cnt-h-p) + (var(--bld-us) + 4px - 6px) / 2 - 2px);margin:auto;opacity:0.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m,.tp-rotv.tp-rotv-expanded .tp-rotv_m{transform:none}.tp-fldv_c,.tp-rotv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c,.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c{display:none}.tp-fldv.tp-fldv-expanded>.tp-fldv_c,.tp-rotv.tp-rotv-expanded .tp-rotv_c{opacity:1;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-coltxtv_m,.tp-lstv{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-coltxtv_mm,.tp-lstv_m{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-coltxtv_mm svg,.tp-lstv_m svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-coltxtv_mm svg path,.tp-lstv_m svg path{fill:currentColor}.tp-coltxtv_w,.tp-pndtxtv{display:flex}.tp-coltxtv_c,.tp-pndtxtv_a{width:100%}.tp-coltxtv_c+.tp-coltxtv_c,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-pndtxtv_a{margin-left:2px}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--elm-br);cursor:pointer;display:block;height:var(--bld-us);position:relative;width:var(--bld-us)}.tp-ckbv_w svg{bottom:0;display:block;height:16px;left:0;margin:auto;opacity:0;position:absolute;right:0;top:0;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:0.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--bld-us)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--bld-s);opacity:1}.tp-colv .tp-popv{left:calc(-1 * var(--cnt-h-p));right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--bld-s)}.tp-colpv_rgb{display:flex;margin-top:var(--bld-s);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-v-p);padding-top:calc(var(--cnt-v-p) + 2px);position:relative}.tp-colpv_a:before{background-color:var(--grv-fg);content:'';height:2px;left:calc(-1 * var(--cnt-h-p));position:absolute;right:calc(-1 * var(--cnt-h-p));top:0}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--elm-br);outline:none;overflow:hidden;position:relative}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--bld-us) * 4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,0.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0,0,0,0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--elm-br);border:rgba(255,255,255,0.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,0.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative;width:100%}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--elm-br);box-shadow:0 0 2px rgba(0,0,0,0.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;pointer-events:none;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--elm-br);border:rgba(255,255,255,0.75) solid 2px;box-sizing:border-box;bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--elm-br)}.tp-colswv.tp-v-disabled{opacity:0.5}.tp-colswv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;cursor:pointer;display:block;height:var(--bld-us);left:0;margin:0;outline:none;padding:0;position:absolute;top:0;width:var(--bld-us)}.tp-colswv_b:focus::after{border:rgba(255,255,255,0.75) solid 2px;border-radius:var(--elm-br);bottom:0;content:'';display:block;left:0;position:absolute;right:0;top:0}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--elm-br);color:var(--lbl-fg);cursor:pointer;height:var(--bld-us);line-height:var(--bld-us);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv.tp-fldv-not .tp-fldv_b{display:none}.tp-fldv_c{border-left:var(--cnt-bg) solid 4px}.tp-fldv_b:hover+.tp-fldv_c{border-left-color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_c{border-left-color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_c{border-left-color:var(--cnt-bg-a)}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--bld-us) * 3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left 0.05s, top 0.05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:0.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-h-p);padding-right:var(--cnt-h-p)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;-ms-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:0.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:160px}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding:0 4px}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:0.5}.tp-mllv_i{display:block;height:calc(var(--bld-us) * 3);line-height:var(--bld-us);padding:0 4px;resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:0.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--bld-us);margin-right:4px;position:relative;width:var(--bld-us)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--bld-s);opacity:1}.tp-p2dv .tp-popv{left:calc(-1 * var(--cnt-h-p));right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-p2dpv{padding-left:calc(var(--bld-us) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:0.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:0.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:6px;box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:168px;padding:var(--cnt-v-p) var(--cnt-h-p);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sldv.tp-v-disabled{opacity:0.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--bld-us);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;bottom:0;content:'';display:block;height:2px;left:0;margin:auto;position:absolute;right:0;top:0}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:'';display:block;height:2px;left:0;margin-bottom:auto;margin-top:auto;position:absolute;right:0;top:0}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--elm-br);bottom:0;content:'';display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv.tp-v-disabled{opacity:0.5}.tp-tabv_i{align-items:flex-end;display:flex;overflow:hidden}.tp-tabv.tp-tabv-nop .tp-tabv_i{height:calc(var(--bld-us) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_i::before{background-color:var(--cnt-bg);bottom:0;content:'';height:2px;left:0;position:absolute;right:0}.tp-tabv_c{border-left:var(--cnt-bg) solid 4px;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p)}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv::before{background-color:var(--cnt-bg);bottom:0;content:'';height:2px;left:-2px;position:absolute;width:2px}.tp-tbiv_b{background-color:var(--cnt-bg);display:block;padding-left:calc(var(--cnt-h-p) + 4px);padding-right:calc(var(--cnt-h-p) + 4px);width:100%}.tp-tbiv_b:hover{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active{background-color:var(--cnt-bg-a)}.tp-tbiv_b:disabled{opacity:0.5}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);opacity:0.5;overflow:hidden;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-txtv{position:relative}.tp-txtv_i{padding:0 4px}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:0.3}.tp-txtv_k{cursor:pointer;height:100%;left:-3px;position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:'';height:calc(var(--bld-us) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:0.1;position:absolute;top:0;transition:border-radius 0.1s, height 0.1s, transform 0.1s, width 0.1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--elm-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) transparent transparent transparent;border-style:solid;border-width:2px;box-sizing:border-box;content:'';font-size:0.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--font-family);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(2px * 2 + var(--bld-us) + var(--cnt-h-p));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0}.tp-rotv.tp-rotv-not .tp-rotv_b{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c,.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1 * var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1 * var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_i{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}"
				);
				this.pool_.getAll().forEach((plugin) => {
					this.embedPluginStyle_(plugin);
				});
				this.registerPlugin({
					plugins: [SliderBladePlugin, ListBladePlugin, TabBladePlugin, TextBladePlugin]
				});
			}
		}

		const VERSION = new Semver('3.0.6');

		exports.BladeApi = BladeApi;
		exports.ButtonApi = ButtonApi;
		exports.FolderApi = FolderApi;
		exports.InputBindingApi = InputBindingApi;
		exports.ListApi = ListApi;
		exports.MonitorBindingApi = MonitorBindingApi;
		exports.Pane = Pane;
		exports.SeparatorApi = SeparatorApi;
		exports.SliderApi = SliderApi;
		exports.TabApi = TabApi;
		exports.TabPageApi = TabPageApi;
		exports.TextApi = TextApi;
		exports.TpChangeEvent = TpChangeEvent;
		exports.VERSION = VERSION;

		Object.defineProperty(exports, '__esModule', { value: true });
	});
});

/* src/nodes/PaneWrapper.svelte generated by Svelte v3.44.2 */

function create_fragment$7(ctx) {
	let div;
	let useActions_action;
	let mounted;
	let dispose;

	return {
		c() {
			div = element('div');
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (!mounted) {
				dispose = [
					action_destroyer(/*attachPaneAction*/ ctx[1].call(null, div)),
					action_destroyer(
						(useActions_action = useActions.call(null, div, /*actionDescriptions*/ ctx[0]))
					)
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (
				useActions_action &&
				is_function(useActions_action.update) &&
				dirty & /*actionDescriptions*/ 1
			)
				useActions_action.update.call(null, /*actionDescriptions*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { type } = $$props;
	let { typeOptions } = $$props;
	let { attach } = $$props;
	let { actionDescriptions } = $$props;
	let parameters = {};
	let pane;
	const dispatch = createEventDispatcher();
	let typeInput;

	// remove tweakpane parameters from pane
	// replace with new type's
	async function updateType(event) {
		dispatch('updateType', event.value);

		for (let [parameterName, parameter] of Object.entries(parameters)) {
			parameter.dispose();
		}

		await tick();

		// attach should update
		parameters = attach(pane);
	}

	function attachPaneAction(element) {
		pane = new tweakpane.Pane({ container: element });
		typeInput = pane
			.addInput({ type }, 'type', { options: typeOptions, index: 0 })
			.on('change', updateType);
		typeInput.controller_.valueController.view.element.parentElement.style.width = '100px';
	}

	onMount(() => {
		parameters = attach(pane);
	});

	$$self.$$set = ($$props) => {
		if ('type' in $$props) $$invalidate(2, (type = $$props.type));
		if ('typeOptions' in $$props) $$invalidate(3, (typeOptions = $$props.typeOptions));
		if ('attach' in $$props) $$invalidate(4, (attach = $$props.attach));
		if ('actionDescriptions' in $$props)
			$$invalidate(0, (actionDescriptions = $$props.actionDescriptions));
	};

	return [actionDescriptions, attachPaneAction, type, typeOptions, attach];
}

class PaneWrapper extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
			type: 2,
			typeOptions: 3,
			attach: 4,
			actionDescriptions: 0
		});
	}
}

function draggableAction(element, handle) {
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	let grabTarget;
	if (handle) {
		grabTarget = handle;
	} else {
		grabTarget = element;
	}
	grabTarget.addEventListener('mousedown', dragMouseDown);
	// for dragging the node
	function dragMouseDown(event) {
		if (event.button == 0) {
			event.preventDefault();
			// get the mouse cursor position at startup
			pos3 = event.clientX;
			pos4 = event.clientY;
			document.addEventListener('mouseup', stopDragElement);
			// call a function whenever the cursor moves
			document.addEventListener('mousemove', elementDrag);
			grabTarget.style.cursor = 'grabbing';
		}
	}
	function elementDrag(event) {
		event.preventDefault();
		// calculate the new cursor position
		pos1 = pos3 - event.clientX;
		pos2 = pos4 - event.clientY;
		pos3 = event.clientX;
		pos4 = event.clientY;
		// set the element's new position
		let top = element.offsetTop - pos2;
		let left = element.offsetLeft - pos1;
		element.style.top = top + 'px';
		element.style.left = left + 'px';
	}
	function stopDragElement(event) {
		// stop moving when mouse button is released:
		grabTarget.style.cursor = '';
		element.dispatchEvent(
			new CustomEvent('release', {
				detail: { x: event.clientX, y: event.clientY }
			})
		);
		document.removeEventListener('mouseup', stopDragElement);
		document.removeEventListener('mousemove', elementDrag);
	}
	return {
		update(newHandle) {
			grabTarget.removeEventListener('mousedown', dragMouseDown);
			if (newHandle) {
				grabTarget = newHandle;
			} else {
				grabTarget = element;
			}
			grabTarget.addEventListener('mousedown', dragMouseDown);
		},
		destroy() {
			grabTarget.removeEventListener('mousedown', dragMouseDown);
			document.removeEventListener('mouseup', stopDragElement);
			document.removeEventListener('mousemove', elementDrag);
		}
	};
}

/* src/nodes/Node.svelte generated by Svelte v3.44.2 */

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[22] = list[i][0];
	child_ctx[23] = list[i][1];
	child_ctx[24] = list;
	child_ctx[25] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[22] = list[i][0];
	child_ctx[23] = list[i][1];
	child_ctx[26] = list;
	child_ctx[27] = i;
	return child_ctx;
}

// (98:0) {#each Object.entries($nodeStore.racks.in) as [parameterName, rackState] (parameterName)}
function create_each_block_1(key_1, ctx) {
	let first;
	let terminalrack;
	let updating_container;
	let current;

	function terminalrack_container_binding(value) {
		/*terminalrack_container_binding*/ ctx[18](value, /*parameterName*/ ctx[22]);
	}

	let terminalrack_props = {
		parameterName: /*parameterName*/ ctx[22],
		parameterType: /*rackState*/ ctx[23].parameterType,
		direction: TerminalDirection.In
	};

	if (/*terminalRackContainers*/ ctx[1].in[/*parameterName*/ ctx[22]] !== void 0) {
		terminalrack_props.container = /*terminalRackContainers*/ ctx[1].in[/*parameterName*/ ctx[22]];
	}

	terminalrack = new TerminalRack({ props: terminalrack_props });
	binding_callbacks.push(() => bind(terminalrack, 'container', terminalrack_container_binding));

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(terminalrack.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(terminalrack, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const terminalrack_changes = {};
			if (dirty & /*$nodeStore*/ 16) terminalrack_changes.parameterName = /*parameterName*/ ctx[22];
			if (dirty & /*$nodeStore*/ 16)
				terminalrack_changes.parameterType = /*rackState*/ ctx[23].parameterType;

			if (!updating_container && dirty & /*terminalRackContainers, Object, $nodeStore*/ 18) {
				updating_container = true;
				terminalrack_changes.container =
					/*terminalRackContainers*/ ctx[1].in[/*parameterName*/ ctx[22]];
				add_flush_callback(() => (updating_container = false));
			}

			terminalrack.$set(terminalrack_changes);
		},
		i(local) {
			if (current) return;
			transition_in(terminalrack.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(terminalrack.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(terminalrack, detaching);
		}
	};
}

// (107:0) {#each Object.entries($nodeStore.racks.out) as [parameterName, rackState] (parameterName)}
function create_each_block$2(key_1, ctx) {
	let first;
	let terminalrack;
	let updating_container;
	let current;

	function terminalrack_container_binding_1(value) {
		/*terminalrack_container_binding_1*/ ctx[19](value, /*parameterName*/ ctx[22]);
	}

	let terminalrack_props = {
		parameterName: /*parameterName*/ ctx[22],
		parameterType: /*rackState*/ ctx[23].parameterType,
		direction: TerminalDirection.Out
	};

	if (/*terminalRackContainers*/ ctx[1].out[/*parameterName*/ ctx[22]] !== void 0) {
		terminalrack_props.container = /*terminalRackContainers*/ ctx[1].out[/*parameterName*/ ctx[22]];
	}

	terminalrack = new TerminalRack({ props: terminalrack_props });
	binding_callbacks.push(() => bind(terminalrack, 'container', terminalrack_container_binding_1));

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(terminalrack.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(terminalrack, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const terminalrack_changes = {};
			if (dirty & /*$nodeStore*/ 16) terminalrack_changes.parameterName = /*parameterName*/ ctx[22];
			if (dirty & /*$nodeStore*/ 16)
				terminalrack_changes.parameterType = /*rackState*/ ctx[23].parameterType;

			if (!updating_container && dirty & /*terminalRackContainers, Object, $nodeStore*/ 18) {
				updating_container = true;
				terminalrack_changes.container =
					/*terminalRackContainers*/ ctx[1].out[/*parameterName*/ ctx[22]];
				add_flush_callback(() => (updating_container = false));
			}

			terminalrack.$set(terminalrack_changes);
		},
		i(local) {
			if (current) return;
			transition_in(terminalrack.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(terminalrack.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(terminalrack, detaching);
		}
	};
}

function create_fragment$6(ctx) {
	let div5;
	let div4;
	let div2;
	let t1;
	let div3;
	let t2;
	let panewrapper;
	let draggableAction_action;
	let cssVars_action;
	let t3;
	let each_blocks_1 = [];
	let each0_lookup = new Map();
	let t4;
	let each_blocks = [];
	let each1_lookup = new Map();
	let each1_anchor;
	let current;
	let mounted;
	let dispose;

	panewrapper = new PaneWrapper({
		props: {
			actionDescriptions: [],
			type: /*$nodeStore*/ ctx[4].type,
			typeOptions: /*$typeOptionsStore*/ ctx[5],
			attach: /*attach*/ ctx[10]
		}
	});

	panewrapper.$on('updateType', /*updateType*/ ctx[9]);
	let each_value_1 = Object.entries(/*$nodeStore*/ ctx[4].racks.in);
	const get_key = (ctx) => /*parameterName*/ ctx[22];

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, (each_blocks_1[i] = create_each_block_1(key, child_ctx)));
	}

	let each_value = Object.entries(/*$nodeStore*/ ctx[4].racks.out);
	const get_key_1 = (ctx) => /*parameterName*/ ctx[22];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$2(ctx, each_value, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, (each_blocks[i] = create_each_block$2(key, child_ctx)));
	}

	return {
		c() {
			div5 = element('div');
			div4 = element('div');
			div2 = element('div');

			div2.innerHTML = `<div class="grab-dot svelte-gv9fxd"></div> 
      <div class="grab-dot svelte-gv9fxd"></div>`;

			t1 = space();
			div3 = element('div');
			t2 = space();
			create_component(panewrapper.$$.fragment);
			t3 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t4 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each1_anchor = empty();
			attr(div2, 'class', 'grab svelte-gv9fxd');
			toggle_class(div2, 'dragging', dragging$1);
			attr(div3, 'class', 'close svelte-gv9fxd');
			attr(div4, 'class', 'header svelte-gv9fxd');
			attr(div5, 'class', 'node no-select svelte-gv9fxd');
			set_style(div5, 'top', /*initialLocation*/ ctx[12].y - nodeHeaderSize / 2 + 'px');
		},
		m(target, anchor) {
			insert(target, div5, anchor);
			append(div5, div4);
			append(div4, div2);
			/*div2_binding*/ ctx[16](div2);
			append(div4, t1);
			append(div4, div3);
			append(div5, t2);
			mount_component(panewrapper, div5, null);
			insert(target, t3, anchor);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(target, anchor);
			}

			insert(target, t4, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each1_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div3, 'click', /*handleClose*/ ctx[11]),
					action_destroyer(/*centerOnInitialLocationAction*/ ctx[13].call(null, div5)),
					action_destroyer(
						(draggableAction_action = draggableAction.call(null, div5, /*grabTarget*/ ctx[2]))
					),
					action_destroyer((cssVars_action = cssVars.call(null, div5, /*styleVars*/ ctx[3]))),
					listen(div5, 'release', /*release_handler*/ ctx[17])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			const panewrapper_changes = {};
			if (dirty & /*$nodeStore*/ 16) panewrapper_changes.type = /*$nodeStore*/ ctx[4].type;
			if (dirty & /*$typeOptionsStore*/ 32)
				panewrapper_changes.typeOptions = /*$typeOptionsStore*/ ctx[5];
			panewrapper.$set(panewrapper_changes);
			if (
				draggableAction_action &&
				is_function(draggableAction_action.update) &&
				dirty & /*grabTarget*/ 4
			)
				draggableAction_action.update.call(null, /*grabTarget*/ ctx[2]);
			if (cssVars_action && is_function(cssVars_action.update) && dirty & /*styleVars*/ 8)
				cssVars_action.update.call(null, /*styleVars*/ ctx[3]);

			if (dirty & /*Object, $nodeStore, TerminalDirection, terminalRackContainers*/ 18) {
				each_value_1 = Object.entries(/*$nodeStore*/ ctx[4].racks.in);
				group_outros();
				each_blocks_1 = update_keyed_each(
					each_blocks_1,
					dirty,
					get_key,
					1,
					ctx,
					each_value_1,
					each0_lookup,
					t4.parentNode,
					outro_and_destroy_block,
					create_each_block_1,
					t4,
					get_each_context_1
				);
				check_outros();
			}

			if (dirty & /*Object, $nodeStore, TerminalDirection, terminalRackContainers*/ 18) {
				each_value = Object.entries(/*$nodeStore*/ ctx[4].racks.out);
				group_outros();
				each_blocks = update_keyed_each(
					each_blocks,
					dirty,
					get_key_1,
					1,
					ctx,
					each_value,
					each1_lookup,
					each1_anchor.parentNode,
					outro_and_destroy_block,
					create_each_block$2,
					each1_anchor,
					get_each_context$2
				);
				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(panewrapper.$$.fragment, local);

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks_1[i]);
			}

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			transition_out(panewrapper.$$.fragment, local);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				transition_out(each_blocks_1[i]);
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div5);
			/*div2_binding*/ ctx[16](null);
			destroy_component(panewrapper);
			if (detaching) detach(t3);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d(detaching);
			}

			if (detaching) detach(t4);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(each1_anchor);
			mounted = false;
			run_all(dispose);
		}
	};
}

let dragging$1 = false;
const nodeHeaderSize = 12;

function instance$6($$self, $$props, $$invalidate) {
	let styleVars;
	let $nodeStore;
	let $ingredient;
	let $ingredientsStore;
	let $typeOptionsStore;
	component_subscribe($$self, ingredientsStore, ($$value) =>
		$$invalidate(21, ($ingredientsStore = $$value))
	);
	let { draggable } = $$props;
	let { nodeId } = $$props;
	let { dockedStatusStore } = $$props;
	setContext('nodeId', nodeId);

	// subscribe to just this node in the nodesStore
	const nodeStore = derived(nodesStore, ($nodes) => $nodes[nodeId]);

	component_subscribe($$self, nodeStore, (value) => $$invalidate(4, ($nodeStore = value)));

	// use these IngredientControl classes to do non svelte display stuff
	// subscribe the type specified on the node
	const ingredient = derived(
		[nodeStore, ingredientsStore],
		([state, ingredients]) => state && ingredients[state.type]
	);

	component_subscribe($$self, ingredient, (value) => $$invalidate(20, ($ingredient = value)));

	// get a list of options for select type
	// just take all from the ingredients store and make them key and value
	const typeOptionsStore = derived(ingredientsStore, (ingredients) =>
		Object.keys(ingredients).reduce(
			(previous, current) => Object.assign(Object.assign({}, previous), { [current]: current }),
			{}
		)
	);

	component_subscribe($$self, typeOptionsStore, (value) =>
		$$invalidate(5, ($typeOptionsStore = value))
	);

	// these will bind to the terminal racks inside
	let terminalRackContainers = { in: {}, out: {} };

	// if the node type changes update the store
	function updateType(event) {
		let defaultNode = $ingredientsStore[event.detail].default(
			$nodeStore.nodeId,
			get_store_value($nodeStore.coords)
		);
		updateNode(defaultNode);
	}

	// use the selected ingredient to attach inputs to tweakpane
	function attach(pane) {
		const paramsStore = $nodeStore.parameters;
		let params = get_store_value(paramsStore);
		let parameterInputs = $ingredient.attach(pane, params, paramsStore);
		$ingredient.subscribe(pane, paramsStore, params);

		// need to know if this has an in connection
		// each of these represents a input/label
		Object.entries(parameterInputs).forEach(([parameterName, input]) => {
			input.controller_.valueController.view.element.parentElement.style.width = '100px';

			// attaching bound divs to terminal racks
			// $node.racks specifies if a rack should be attached
			if (parameterName in $nodeStore.racks.in) {
				input.controller_.view.element.prepend(terminalRackContainers.in[parameterName]);
			}

			if (parameterName in $nodeStore.racks.out) {
				input.controller_.view.element.append(terminalRackContainers.out[parameterName]);
			}
		});

		return parameterInputs;
	}

	// delete node on close button
	function handleClose(event) {
		removeNode($nodeStore);
	}

	let grabTarget;
	const initialLocation = get_store_value($nodeStore.coords);

	function centerOnInitialLocationAction(element) {
		const midpoint = element.getBoundingClientRect().width / 2;
		element.style.left = initialLocation.x - midpoint + 'px';
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			grabTarget = $$value;
			$$invalidate(2, grabTarget);
		});
	}

	const release_handler = (event) => {
		droppedNodeCoordsStore.set({ dockedStatusStore, coords: event.detail });
	};

	function terminalrack_container_binding(value, parameterName) {
		if ($$self.$$.not_equal(terminalRackContainers.in[parameterName], value)) {
			terminalRackContainers.in[parameterName] = value;
			$$invalidate(1, terminalRackContainers);
		}
	}

	function terminalrack_container_binding_1(value, parameterName) {
		if ($$self.$$.not_equal(terminalRackContainers.out[parameterName], value)) {
			terminalRackContainers.out[parameterName] = value;
			$$invalidate(1, terminalRackContainers);
		}
	}

	$$self.$$set = ($$props) => {
		if ('draggable' in $$props) $$invalidate(14, (draggable = $$props.draggable));
		if ('nodeId' in $$props) $$invalidate(15, (nodeId = $$props.nodeId));
		if ('dockedStatusStore' in $$props)
			$$invalidate(0, (dockedStatusStore = $$props.dockedStatusStore));
	};

	$$invalidate(3, (styleVars = { nodeHeaderSize: nodeHeaderSize + 'px' }));

	return [
		dockedStatusStore,
		terminalRackContainers,
		grabTarget,
		styleVars,
		$nodeStore,
		$typeOptionsStore,
		nodeStore,
		ingredient,
		typeOptionsStore,
		updateType,
		attach,
		handleClose,
		initialLocation,
		centerOnInitialLocationAction,
		draggable,
		nodeId,
		div2_binding,
		release_handler,
		terminalrack_container_binding,
		terminalrack_container_binding_1
	];
}

class Node extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
			draggable: 14,
			nodeId: 15,
			dockedStatusStore: 0
		});
	}
}

function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}

function tick_spring(ctx, last_value, current_value, target_value) {
	if (typeof current_value === 'number' || is_date(current_value)) {
		// @ts-ignore
		const delta = target_value - current_value;
		// @ts-ignore
		const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
		const spring = ctx.opts.stiffness * delta;
		const damper = ctx.opts.damping * velocity;
		const acceleration = (spring - damper) * ctx.inv_mass;
		const d = (velocity + acceleration) * ctx.dt;
		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
			return target_value; // settled
		} else {
			ctx.settled = false; // signal loop to keep ticking
			// @ts-ignore
			return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
		}
	} else if (Array.isArray(current_value)) {
		// @ts-ignore
		return current_value.map((_, i) =>
			tick_spring(ctx, last_value[i], current_value[i], target_value[i])
		);
	} else if (typeof current_value === 'object') {
		const next_value = {};
		for (const k in current_value) {
			// @ts-ignore
			next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
		}
		// @ts-ignore
		return next_value;
	} else {
		throw new Error(`Cannot spring ${typeof current_value} values`);
	}
}
function spring(value, opts = {}) {
	const store = writable(value);
	const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
	let last_time;
	let task;
	let current_token;
	let last_value = value;
	let target_value = value;
	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;
	function set(new_value, opts = {}) {
		target_value = new_value;
		const token = (current_token = {});
		if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = now();
			last_value = new_value;
			store.set((value = target_value));
			return Promise.resolve();
		} else if (opts.soft) {
			const rate = opts.soft === true ? 0.5 : +opts.soft;
			inv_mass_recovery_rate = 1 / (rate * 60);
			inv_mass = 0; // infinite mass, unaffected by spring forces
		}
		if (!task) {
			last_time = now();
			cancel_task = false;
			task = loop((now) => {
				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}
				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
				const ctx = {
					inv_mass,
					opts: spring,
					settled: true,
					dt: ((now - last_time) * 60) / 1000
				};
				const next_value = tick_spring(ctx, last_value, value, target_value);
				last_time = now;
				last_value = value;
				store.set((value = next_value));
				if (ctx.settled) {
					task = null;
				}
				return !ctx.settled;
			});
		}
		return new Promise((fulfil) => {
			task.promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}
	const spring = {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};
	return spring;
}

/* src/cursor-circle/CursorCircle.svelte generated by Svelte v3.44.2 */

function create_fragment$5(ctx) {
	let svg;
	let circle;
	let circle_cx_value;
	let circle_cy_value;
	let circle_r_value;
	let mounted;
	let dispose;

	return {
		c() {
			svg = svg_element('svg');
			circle = svg_element('circle');
			attr(circle, 'cx', (circle_cx_value = /*$cursorLocation*/ ctx[0].x));
			attr(circle, 'cy', (circle_cy_value = /*$cursorLocation*/ ctx[0].y));
			attr(circle, 'r', (circle_r_value = /*$size*/ ctx[1] > 0 ? /*$size*/ ctx[1] : 0));
			attr(circle, 'class', 'svelte-1dqbyly');
			attr(svg, 'class', 'svelte-1dqbyly');
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, circle);

			if (!mounted) {
				dispose = [
					listen(window, 'mouseup', /*handleMouseUp*/ ctx[6]),
					listen(svg, 'mousemove', /*handleMouseMove*/ ctx[4]),
					listen(svg, 'mousedown', /*handleMouseDown*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (
				dirty & /*$cursorLocation*/ 1 &&
				circle_cx_value !== (circle_cx_value = /*$cursorLocation*/ ctx[0].x)
			) {
				attr(circle, 'cx', circle_cx_value);
			}

			if (
				dirty & /*$cursorLocation*/ 1 &&
				circle_cy_value !== (circle_cy_value = /*$cursorLocation*/ ctx[0].y)
			) {
				attr(circle, 'cy', circle_cy_value);
			}

			if (
				dirty & /*$size*/ 2 &&
				circle_r_value !== (circle_r_value = /*$size*/ ctx[1] > 0 ? /*$size*/ ctx[1] : 0)
			) {
				attr(circle, 'r', circle_r_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
			mounted = false;
			run_all(dispose);
		}
	};
}

const touchDuration = 500;

function instance$5($$self, $$props, $$invalidate) {
	let $cursorLocation;
	let $size;
	let coords = { x: 0, y: 0 };
	let cursorLocation = spring(coords, { stiffness: 0.2, damping: 0.65 });
	component_subscribe($$self, cursorLocation, (value) =>
		$$invalidate(0, ($cursorLocation = value))
	);
	let size = spring(0);
	component_subscribe($$self, size, (value) => $$invalidate(1, ($size = value)));

	// this timer will fire a callback if you press long enough
	var longPressTimer;

	let dispatch = createEventDispatcher();

	// follow the mouse
	function handleMouseMove(event) {
		event.preventDefault();
		$$invalidate(7, (coords = { x: event.clientX, y: event.clientY }));
	}

	function handleMouseDown(event) {
		// click
		if (!longPressTimer && event.button == 0) {
			size.set(20);

			// send an event at end of timer
			longPressTimer = setTimeout(() => {
				size.set(0);

				// notify parent that there has been a long press
				dispatch('longpress', coords);
			}, touchDuration);
		}
	}

	function handleMouseUp() {
		// nullify longpress timer from click
		size.set(0);

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*coords*/ 128) {
			{
				cursorLocation.set(coords);
			}
		}
	};

	return [
		$cursorLocation,
		$size,
		cursorLocation,
		size,
		handleMouseMove,
		handleMouseDown,
		handleMouseUp,
		coords
	];
}

class CursorCircle extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
	}
}

/* src/connections/Cable.svelte generated by Svelte v3.44.2 */

function create_if_block$1(ctx) {
	let svg_1;
	let path;
	let cssVars_action;
	let mounted;
	let dispose;

	return {
		c() {
			svg_1 = svg_element('svg');
			path = svg_element('path');
			attr(path, 'd', /*pathString*/ ctx[10]);
			attr(path, 'class', 'svelte-1413mcr');
			set_style(svg_1, 'width', /*width*/ ctx[2] + 'px');
			set_style(svg_1, 'height', /*height*/ ctx[3] + 'px');
			set_style(svg_1, 'left', /*left*/ ctx[7] + 'px');
			set_style(svg_1, 'top', /*top*/ ctx[8] + 'px');
			attr(svg_1, 'class', 'svelte-1413mcr');
			toggle_class(svg_1, 'dragging', dragging);
		},
		m(target, anchor) {
			insert(target, svg_1, anchor);
			append(svg_1, path);
			/*svg_1_binding*/ ctx[17](svg_1);

			if (!mounted) {
				dispose = action_destroyer(
					(cssVars_action = cssVars.call(null, svg_1, /*styleVars*/ ctx[9]))
				);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*pathString*/ 1024) {
				attr(path, 'd', /*pathString*/ ctx[10]);
			}

			if (dirty & /*width*/ 4) {
				set_style(svg_1, 'width', /*width*/ ctx[2] + 'px');
			}

			if (dirty & /*height*/ 8) {
				set_style(svg_1, 'height', /*height*/ ctx[3] + 'px');
			}

			if (dirty & /*left*/ 128) {
				set_style(svg_1, 'left', /*left*/ ctx[7] + 'px');
			}

			if (dirty & /*top*/ 256) {
				set_style(svg_1, 'top', /*top*/ ctx[8] + 'px');
			}

			if (cssVars_action && is_function(cssVars_action.update) && dirty & /*styleVars*/ 512)
				cssVars_action.update.call(null, /*styleVars*/ ctx[9]);
		},
		d(detaching) {
			if (detaching) detach(svg_1);
			/*svg_1_binding*/ ctx[17](null);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$4(ctx) {
	let if_block_anchor;
	let if_block =
		/*$inCoords*/ ctx[5].x &&
		/*$inCoords*/ ctx[5].y &&
		/*$outCoords*/ ctx[4].x &&
		/*$outCoords*/ ctx[4].y &&
		create_if_block$1(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (
				/*$inCoords*/ ctx[5].x &&
				/*$inCoords*/ ctx[5].y &&
				/*$outCoords*/ ctx[4].x &&
				/*$outCoords*/ ctx[4].y
			) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

let dragging = false;
const pathStrokeWidth = 4;

function instance$4($$self, $$props, $$invalidate) {
	let x1;
	let y1;
	let x2;
	let y2;
	let width;
	let height;
	let pathString;
	let styleVars;

	let $outCoords,
		$$unsubscribe_outCoords = noop,
		$$subscribe_outCoords = () => (
			$$unsubscribe_outCoords(),
			($$unsubscribe_outCoords = subscribe(outCoords, ($$value) =>
				$$invalidate(4, ($outCoords = $$value))
			)),
			outCoords
		);

	let $inCoords,
		$$unsubscribe_inCoords = noop,
		$$subscribe_inCoords = () => (
			$$unsubscribe_inCoords(),
			($$unsubscribe_inCoords = subscribe(inCoords, ($$value) =>
				$$invalidate(5, ($inCoords = $$value))
			)),
			inCoords
		);

	$$self.$$.on_destroy.push(() => $$unsubscribe_outCoords());
	$$self.$$.on_destroy.push(() => $$unsubscribe_inCoords());
	let { inCoords } = $$props;
	$$subscribe_inCoords();
	let { outCoords } = $$props;
	$$subscribe_outCoords();
	let svg;
	let left, top;
	let startY;
	let endY;

	function svg_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			svg = $$value;
			$$invalidate(6, svg);
		});
	}

	$$self.$$set = ($$props) => {
		if ('inCoords' in $$props) $$subscribe_inCoords($$invalidate(0, (inCoords = $$props.inCoords)));
		if ('outCoords' in $$props)
			$$subscribe_outCoords($$invalidate(1, (outCoords = $$props.outCoords)));
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$inCoords*/ 32) {
			$$invalidate(16, (x1 = $inCoords.x));
		}

		if ($$self.$$.dirty & /*$inCoords*/ 32) {
			$$invalidate(14, (y1 = $inCoords.y));
		}

		if ($$self.$$.dirty & /*$outCoords*/ 16) {
			$$invalidate(15, (x2 = $outCoords.x));
		}

		if ($$self.$$.dirty & /*$outCoords*/ 16) {
			$$invalidate(13, (y2 = $outCoords.y));
		}

		if ($$self.$$.dirty & /*x2, x1*/ 98304) {
			$$invalidate(2, (width = Math.abs(x2 - x1)));
		}

		if ($$self.$$.dirty & /*y2, y1*/ 24576) {
			$$invalidate(3, (height = Math.abs(y2 - y1)));
		}

		if ($$self.$$.dirty & /*x1, x2, y1, y2, height*/ 122888) {
			// adjust svg position
			// there's a more concise way to do this
			// need to account for which side of the cable corresponds to left
			// 1st point is on left
			if (x1 < x2) {
				// will set left, top, startY, and height
				$$invalidate(7, (left = x1));

				// check if 1st point is above
				if (y1 < y2) {
					// top left is (0, 0) inside svg
					// going to bottom right (width, height)
					// absolute top on svg
					$$invalidate(8, (top = y1));

					// start y is the inside svg y coord at leftmost point
					$$invalidate(11, (startY = 0));

					// end y is the height down from start y (inside svg)
					$$invalidate(12, (endY = height));
				} else {
					// bottom left to top right
					$$invalidate(8, (top = y2));

					$$invalidate(11, (startY = height));
					$$invalidate(12, (endY = 0));
				}
			} else {
				$$invalidate(7, (left = x2));

				if (y1 < y2) {
					// bottom left to top right
					$$invalidate(8, (top = y1));

					$$invalidate(11, (startY = height));
					$$invalidate(12, (endY = 0));
				} else {
					//  top left to bottom right
					$$invalidate(8, (top = y2));

					$$invalidate(11, (startY = 0));
					$$invalidate(12, (endY = height));
				}
			}
		}

		if ($$self.$$.dirty & /*startY, height, width, endY*/ 6156) {
			// making bezier with 4 points (start, [0, height/2], [width, height/2], end)
			$$invalidate(
				10,
				(pathString = `M ${0} ${startY} C ${0} ${height / 2}, ${width} ${
					height / 2
				}, ${width} ${endY}`)
			);
		}
	};

	$$invalidate(9, (styleVars = { pathStrokeWidth: pathStrokeWidth + 'px' }));

	return [
		inCoords,
		outCoords,
		width,
		height,
		$outCoords,
		$inCoords,
		svg,
		left,
		top,
		styleVars,
		pathString,
		startY,
		endY,
		y2,
		y1,
		x2,
		x1,
		svg_1_binding
	];
}

class Cable extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			inCoords: 0,
			outCoords: 1
		});
	}
}

/* src/connections/LiveConnection.svelte generated by Svelte v3.44.2 */

function create_if_block(ctx) {
	let cable;
	let t;
	let terminal;
	let current;

	cable = new Cable({
		props: {
			inCoords: /*$liveConnectionStore*/ ctx[0].dragCoordsStore,
			outCoords: /*$liveConnectionStore*/ ctx[0].anchorCoordsStore
		}
	});

	terminal = new Terminal({
		props: {
			actionDescriptions: [{ action: /*dragTerminalAction*/ ctx[2] }],
			direction: /*$liveConnectionStore*/ ctx[0].dragTerminalDirection,
			expanded: true,
			cabled: true,
			live: true,
			terminalHeight
		}
	});

	return {
		c() {
			create_component(cable.$$.fragment);
			t = space();
			create_component(terminal.$$.fragment);
		},
		m(target, anchor) {
			mount_component(cable, target, anchor);
			insert(target, t, anchor);
			mount_component(terminal, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const cable_changes = {};
			if (dirty & /*$liveConnectionStore*/ 1)
				cable_changes.inCoords = /*$liveConnectionStore*/ ctx[0].dragCoordsStore;
			if (dirty & /*$liveConnectionStore*/ 1)
				cable_changes.outCoords = /*$liveConnectionStore*/ ctx[0].anchorCoordsStore;
			cable.$set(cable_changes);
			const terminal_changes = {};
			if (dirty & /*$liveConnectionStore*/ 1)
				terminal_changes.direction = /*$liveConnectionStore*/ ctx[0].dragTerminalDirection;
			terminal.$set(terminal_changes);
		},
		i(local) {
			if (current) return;
			transition_in(cable.$$.fragment, local);
			transition_in(terminal.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(cable.$$.fragment, local);
			transition_out(terminal.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(cable, detaching);
			if (detaching) detach(t);
			destroy_component(terminal, detaching);
		}
	};
}

function create_fragment$3(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*$liveConnectionStore*/ ctx[0] && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*$liveConnectionStore*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*$liveConnectionStore*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let dragCoordsStore;
	let $dropCableStore;

	let $dragCoordsStore,
		$$unsubscribe_dragCoordsStore = noop,
		$$subscribe_dragCoordsStore = () => (
			$$unsubscribe_dragCoordsStore(),
			($$unsubscribe_dragCoordsStore = subscribe(dragCoordsStore, ($$value) =>
				$$invalidate(4, ($dragCoordsStore = $$value))
			)),
			dragCoordsStore
		);

	let $liveConnectionStore;
	component_subscribe($$self, dropCableStore, ($$value) =>
		$$invalidate(3, ($dropCableStore = $$value))
	);
	component_subscribe($$self, liveConnectionStore, ($$value) =>
		$$invalidate(0, ($liveConnectionStore = $$value))
	);
	$$self.$$.on_destroy.push(() => $$unsubscribe_dragCoordsStore());

	function dragTerminalAction(element) {
		let dragTerminalTimer;
		element.style.left = $dragCoordsStore.x + 'px';
		element.style.top = $dragCoordsStore.y + 'px';

		const moveTerminal = (event) => {
			event.preventDefault();
			element.style.top = event.y + 'px';
			element.style.left = event.x + 'px';
		};

		window.addEventListener('mousemove', moveTerminal);

		dragTerminalTimer = setInterval(() => {
			const rect = element.getBoundingClientRect();
			const center = calculateCenter(rect);
			dragCoordsStore.set({ x: center.x, y: center.y });
		}, 10);

		// update restaurant that cable has been dropped
		const dropCable = (event) => {
			$dropCableStore({ x: event.pageX, y: event.pageY });

			// this is causing the live connection attach callback to disappear
			window.removeEventListener('mouseup', dropCable);
		};

		window.addEventListener('mouseup', dropCable);

		return {
			destroy() {
				window.removeEventListener('mousemove', moveTerminal);
				window.removeEventListener('mouseup', dropCable);
				clearInterval(dragTerminalTimer);
			}
		};
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$liveConnectionStore*/ 1) {
			// access to a store of the coords for when a cable is being dragged
			$$subscribe_dragCoordsStore(
				$$invalidate(
					1,
					(dragCoordsStore = $liveConnectionStore && $liveConnectionStore.dragCoordsStore)
				)
			);
		}
	};

	return [$liveConnectionStore, dragCoordsStore, dragTerminalAction];
}

class LiveConnection extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
	}
}

/* src/connections/Connections.svelte generated by Svelte v3.44.2 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i][0];
	child_ctx[5] = list[i][1];
	return child_ctx;
}

// (80:0) {#each Object.entries($connectionsCoordsStore) as [connectionId, coords] (connectionId)}
function create_each_block$1(key_1, ctx) {
	let first;
	let cable;
	let current;

	cable = new Cable({
		props: {
			inCoords: /*coords*/ ctx[5].in,
			outCoords: /*coords*/ ctx[5].out
		}
	});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(cable.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(cable, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const cable_changes = {};
			if (dirty & /*$connectionsCoordsStore*/ 1) cable_changes.inCoords = /*coords*/ ctx[5].in;
			if (dirty & /*$connectionsCoordsStore*/ 1) cable_changes.outCoords = /*coords*/ ctx[5].out;
			cable.$set(cable_changes);
		},
		i(local) {
			if (current) return;
			transition_in(cable.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(cable.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(cable, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t;
	let liveconnection;
	let current;
	let each_value = Object.entries(/*$connectionsCoordsStore*/ ctx[0]);
	const get_key = (ctx) => /*connectionId*/ ctx[4];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, (each_blocks[i] = create_each_block$1(key, child_ctx)));
	}

	liveconnection = new LiveConnection({});

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			create_component(liveconnection.$$.fragment);
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, t, anchor);
			mount_component(liveconnection, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*Object, $connectionsCoordsStore*/ 1) {
				each_value = Object.entries(/*$connectionsCoordsStore*/ ctx[0]);
				group_outros();
				each_blocks = update_keyed_each(
					each_blocks,
					dirty,
					get_key,
					1,
					ctx,
					each_value,
					each_1_lookup,
					t.parentNode,
					outro_and_destroy_block,
					create_each_block$1,
					t,
					get_each_context$1
				);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(liveconnection.$$.fragment, local);
			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(liveconnection.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(t);
			destroy_component(liveconnection, detaching);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let $connectionsStore;
	let $connectionsCoordsStore;
	component_subscribe($$self, connectionsStore, ($$value) =>
		$$invalidate(3, ($connectionsStore = $$value))
	);

	let connectionsCoordsStore = derived(allNodesTerminalCentersStore, (nodesTerminalCenters) => {
		let allCoords = {};

		nodesTerminalCenters.forEach((terminalCenter) => {
			if (terminalCenter.connectionId) {
				if (!allCoords[terminalCenter.connectionId]) {
					allCoords[terminalCenter.connectionId] = { in: null, out: null };
				}

				allCoords[terminalCenter.connectionId][terminalCenter.direction] = terminalCenter.coords;
			}
		});

		return allCoords;
	});

	component_subscribe($$self, connectionsCoordsStore, (value) =>
		$$invalidate(0, ($connectionsCoordsStore = value))
	);

	// need to know when a connection should be deleted
	// this is based on whether its referenced nodes stop existing
	// create derived stores (from nodesStore) that subscribe to call
	// a "check for delete connection" function
	// need to unsubscribe to derived stores so multiple calls
	// aren't registered for the same derived node store
	let unsubscribers = [];

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*unsubscribers, $connectionsStore*/ 12) {
			{
				// call the unsubscribe functions previously set
				unsubscribers.forEach((unsubscriber) => {
					unsubscriber();
				});

				$$invalidate(2, (unsubscribers = []));

				// loop each connection
				Object.entries($connectionsStore).forEach(([connectionId, connection]) => {
					let inNodeId = connection.in.nodeId;
					let outNodeId = connection.out.nodeId;
					let inParameterName = connection.in.parameterName;
					let outParameterName = connection.out.parameterName;

					// make a derived store with the state of the in node
					let inNode = derived(nodesStore, (nodes) => {
						return nodes[inNodeId];
					});

					// subscribe to changes in the in node's state
					// and remove connection if necessary
					let inUnsubscriber = inNode.subscribe((node) => {
						// node may be removed
						if (node) {
							// type may change
							if (!Object.keys(node.racks.in).includes(inParameterName)) {
								removeConnection(connection.connectionId);
							}
						} else {
							removeConnection(connection.connectionId);
						}
					});

					// do the same for the out node
					let outNode = derived(nodesStore, (nodes) => {
						return nodes[outNodeId];
					});

					let outUnsubscriber = outNode.subscribe((node) => {
						if (node) {
							if (!Object.keys(node.racks.out).includes(outParameterName)) {
								removeConnection(connection.connectionId);
							}
						} else {
							removeConnection(connection.connectionId);
						}
					});

					// add these unsubscribers to this list that will be called
					// next time connectionsStore updates
					unsubscribers.push(inUnsubscriber);

					unsubscribers.push(outUnsubscriber);
				});
			}
		}
	};

	return [$connectionsCoordsStore, connectionsCoordsStore, unsubscribers, $connectionsStore];
}

class Connections extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
	}
}

/* src/docks/Dock.svelte generated by Svelte v3.44.2 */

function create_fragment$1(ctx) {
	let div;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			div = element('div');
			if (default_slot) default_slot.c();
			attr(div, 'class', 'dock svelte-1wcc820');
			toggle_class(div, 'expanded', /*expanded*/ ctx[1]);
			toggle_class(div, 'in', /*direction*/ ctx[0] == TerminalDirection.In);
			toggle_class(div, 'out', /*direction*/ ctx[0] == TerminalDirection.Out);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(checkNearAction.call(null, div, 10)),
					action_destroyer(/*dropInAction*/ ctx[2].call(null, div)),
					listen(div, 'near', /*near_handler*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[3],
						!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
						null
					);
				}
			}

			if (dirty & /*expanded*/ 2) {
				toggle_class(div, 'expanded', /*expanded*/ ctx[1]);
			}

			if (dirty & /*direction, TerminalDirection*/ 1) {
				toggle_class(div, 'in', /*direction*/ ctx[0] == TerminalDirection.In);
			}

			if (dirty & /*direction, TerminalDirection*/ 1) {
				toggle_class(div, 'out', /*direction*/ ctx[0] == TerminalDirection.Out);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { direction } = $$props;
	let expanded = false;

	function dropInAction(element) {
		const rect = element.getBoundingClientRect();

		droppedNodeCoordsStore.subscribe(({ dockedStatusStore, coords }) => {
			const within = checkPointWithinBox(coords, rect);

			if (within) {
				dockedStatusStore.set({ docked: true, direction });
			}
		});
	}

	const near_handler = (event) => {
		$$invalidate(1, (expanded = event.detail));
	};

	$$self.$$set = ($$props) => {
		if ('direction' in $$props) $$invalidate(0, (direction = $$props.direction));
		if ('$$scope' in $$props) $$invalidate(3, ($$scope = $$props.$$scope));
	};

	return [direction, expanded, dropInAction, $$scope, slots, near_handler];
}

class Dock extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { direction: 0 });
	}
}

/* src/Dish.svelte generated by Svelte v3.44.2 */

const { window: window_1 } = globals;

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i][0];
	child_ctx[3] = list[i][1];
	return child_ctx;
}

// (34:0) {#each Object.entries($nodesStore) as [nodeId, node] (node)}
function create_each_block(key_1, ctx) {
	let first;
	let node;
	let current;
	const node_spread_levels = [{ draggable: true }, /*node*/ ctx[3]];
	let node_props = {};

	for (let i = 0; i < node_spread_levels.length; i += 1) {
		node_props = assign(node_props, node_spread_levels[i]);
	}

	node = new Node({ props: node_props });

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(node.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(node, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			const node_changes =
				dirty & /*Object, $nodesStore*/ 1
					? get_spread_update(node_spread_levels, [
							node_spread_levels[0],
							get_spread_object(/*node*/ ctx[3])
					  ])
					: {};

			node.$set(node_changes);
		},
		i(local) {
			if (current) return;
			transition_in(node.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(node.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(node, detaching);
		}
	};
}

function create_fragment(ctx) {
	let canvas;
	let t0;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t1;
	let dock0;
	let t2;
	let dock1;
	let t3;
	let connections;
	let t4;
	let cursorcircle;
	let current;
	let mounted;
	let dispose;
	let each_value = Object.entries(/*$nodesStore*/ ctx[0]);
	const get_key = (ctx) => /*node*/ ctx[3];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, (each_blocks[i] = create_each_block(key, child_ctx)));
	}

	dock0 = new Dock({
		props: { direction: TerminalDirection.In }
	});

	dock1 = new Dock({
		props: { direction: TerminalDirection.Out }
	});

	connections = new Connections({});
	cursorcircle = new CursorCircle({});
	cursorcircle.$on('longpress', /*longpress_handler*/ ctx[1]);

	return {
		c() {
			canvas = element('canvas');
			t0 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			create_component(dock0.$$.fragment);
			t2 = space();
			create_component(dock1.$$.fragment);
			t3 = space();
			create_component(connections.$$.fragment);
			t4 = space();
			create_component(cursorcircle.$$.fragment);
			attr(canvas, 'height', window.innerHeight);
			attr(canvas, 'width', window.innerWidth);
			attr(canvas, 'class', 'svelte-1oifv8o');
		},
		m(target, anchor) {
			insert(target, canvas, anchor);
			insert(target, t0, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, t1, anchor);
			mount_component(dock0, target, anchor);
			insert(target, t2, anchor);
			mount_component(dock1, target, anchor);
			insert(target, t3, anchor);
			mount_component(connections, target, anchor);
			insert(target, t4, anchor);
			mount_component(cursorcircle, target, anchor);
			current = true;

			if (!mounted) {
				dispose = listen(window_1, 'scroll', prevent_default(scroll_handler));
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*Object, $nodesStore*/ 1) {
				each_value = Object.entries(/*$nodesStore*/ ctx[0]);
				group_outros();
				each_blocks = update_keyed_each(
					each_blocks,
					dirty,
					get_key,
					1,
					ctx,
					each_value,
					each_1_lookup,
					t1.parentNode,
					outro_and_destroy_block,
					create_each_block,
					t1,
					get_each_context
				);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(dock0.$$.fragment, local);
			transition_in(dock1.$$.fragment, local);
			transition_in(connections.$$.fragment, local);
			transition_in(cursorcircle.$$.fragment, local);
			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(dock0.$$.fragment, local);
			transition_out(dock1.$$.fragment, local);
			transition_out(connections.$$.fragment, local);
			transition_out(cursorcircle.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(canvas);
			if (detaching) detach(t0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(t1);
			destroy_component(dock0, detaching);
			if (detaching) detach(t2);
			destroy_component(dock1, detaching);
			if (detaching) detach(t3);
			destroy_component(connections, detaching);
			if (detaching) detach(t4);
			destroy_component(cursorcircle, detaching);
			mounted = false;
			dispose();
		}
	};
}

let pierogi = new PierogiControl().default('1', { x: 500, y: 200 });
let plate = new PlateControl().default('2', { x: 900, y: 200 });
const initialNodesState = { 1: pierogi, 2: plate };
nodesStore.set(initialNodesState);
const createDefaultNode = (coords) => new ColorControl().default(v4(), coords);

const initialIngredientState = {
	plate: new PlateControl(),
	pierogi: new PierogiControl(),
	color: new ColorControl()
};

ingredientsStore.set(initialIngredientState);

const scroll_handler = () => {};

function instance($$self, $$props, $$invalidate) {
	let $nodesStore;
	component_subscribe($$self, nodesStore, ($$value) => $$invalidate(0, ($nodesStore = $$value)));

	const longpress_handler = (event) => {
		let coords = event.detail;
		let node = createDefaultNode(coords);
		addNode(node);
	};

	return [$nodesStore, longpress_handler];
}

class Dish extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

let onscroll = () => {
	window.scrollTo(0, 0);
};
window.onscroll = onscroll;
new Dish({
	target: document.body
});
