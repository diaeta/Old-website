import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path('.byterover')
BASE_DIR.mkdir(exist_ok=True)

HANDBOOK_PATH = BASE_DIR / 'handbook.json'
MODULES_PATH = BASE_DIR / 'modules.json'
KNOWLEDGE_PATH = BASE_DIR / 'knowledge.json'
PLANS_PATH = BASE_DIR / 'plans.json'
REFLECTION_PATH = BASE_DIR / 'reflections.json'


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError:
        return default


def _save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def _print(data: Any) -> None:
    json.dump(data, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write('\n')


def cmd_check_handbook_existence(args: argparse.Namespace) -> None:
    handbook = _load_json(HANDBOOK_PATH, None)
    exists = handbook is not None
    result = {
        'exists': exists,
        'path': str(HANDBOOK_PATH.resolve()),
        'last_updated': handbook.get('last_updated') if handbook else None,
        'last_synced': handbook.get('last_synced') if handbook else None,
    }
    _print(result)


def cmd_create_handbook(args: argparse.Namespace) -> None:
    if HANDBOOK_PATH.exists():
        handbook = _load_json(HANDBOOK_PATH, {})
    else:
        handbook = {}
    handbook.setdefault('title', args.title or 'Diaeta Handbook')
    handbook.setdefault('sections', [])
    handbook['notes'] = handbook.get('notes', [])
    if args.note:
        handbook['notes'].append({'message': args.note, 'timestamp': _timestamp()})
    now = _timestamp()
    handbook['created'] = handbook.get('created', now)
    handbook['last_updated'] = now
    handbook['last_synced'] = now
    handbook['pending_changes'] = []
    _save_json(HANDBOOK_PATH, handbook)
    _print({'status': 'created', 'path': str(HANDBOOK_PATH.resolve())})


def cmd_check_handbook_sync(args: argparse.Namespace) -> None:
    handbook = _load_json(HANDBOOK_PATH, None)
    if not handbook:
        _print({'error': 'handbook_missing'})
        return
    pending = handbook.get('pending_changes', [])
    result = {
        'in_sync': len(pending) == 0,
        'pending_changes': pending,
        'last_updated': handbook.get('last_updated'),
        'last_synced': handbook.get('last_synced'),
    }
    _print(result)


def cmd_update_handbook(args: argparse.Namespace) -> None:
    handbook = _load_json(HANDBOOK_PATH, None)
    if not handbook:
        _print({'error': 'handbook_missing'})
        return
    if args.change:
        change_entry = {
            'summary': args.change,
            'timestamp': _timestamp(),
        }
        handbook.setdefault('pending_changes', []).append(change_entry)
    if args.apply:
        handbook['last_synced'] = _timestamp()
        handbook['pending_changes'] = []
    handbook['last_updated'] = _timestamp()
    _save_json(HANDBOOK_PATH, handbook)
    _print({'status': 'updated', 'pending_changes': handbook.get('pending_changes', [])})


def cmd_list_modules(args: argparse.Namespace) -> None:
    modules = _load_json(MODULES_PATH, [])
    _print({'modules': modules})


def cmd_store_module(args: argparse.Namespace) -> None:
    modules: List[Dict[str, Any]] = _load_json(MODULES_PATH, [])
    if any(m['name'] == args.name for m in modules):
        _print({'error': 'module_exists', 'name': args.name})
        return
    module = {
        'name': args.name,
        'summary': args.summary,
        'details': args.details,
        'created': _timestamp(),
        'updated': _timestamp(),
    }
    modules.append(module)
    _save_json(MODULES_PATH, modules)
    _print({'status': 'stored', 'module': module})


def cmd_update_module(args: argparse.Namespace) -> None:
    modules: List[Dict[str, Any]] = _load_json(MODULES_PATH, [])
    for module in modules:
        if module['name'] == args.name:
            if args.summary is not None:
                module['summary'] = args.summary
            if args.details is not None:
                module['details'] = args.details
            module['updated'] = _timestamp()
            _save_json(MODULES_PATH, modules)
            _print({'status': 'updated', 'module': module})
            return
    _print({'error': 'module_not_found', 'name': args.name})


def cmd_search_module(args: argparse.Namespace) -> None:
    modules: List[Dict[str, Any]] = _load_json(MODULES_PATH, [])
    query = args.query.lower()
    matches = [m for m in modules if query in m.get('name', '').lower() or query in (m.get('summary') or '').lower()]
    _print({'query': args.query, 'matches': matches})


def cmd_store_knowledge(args: argparse.Namespace) -> None:
    data: Dict[str, List[Dict[str, Any]]] = _load_json(KNOWLEDGE_PATH, {})
    entries = data.setdefault(args.topic, [])
    entry = {
        'content': args.content,
        'timestamp': _timestamp(),
    }
    if args.tags:
        entry['tags'] = args.tags.split(',')
    entries.append(entry)
    _save_json(KNOWLEDGE_PATH, data)
    _print({'status': 'stored', 'topic': args.topic, 'count': len(entries)})


def cmd_retrieve_knowledge(args: argparse.Namespace) -> None:
    data: Dict[str, List[Dict[str, Any]]] = _load_json(KNOWLEDGE_PATH, {})
    if args.topic:
        entries = data.get(args.topic, [])
        _print({'topic': args.topic, 'entries': entries})
    else:
        _print({'topics': data})


def _load_plans() -> List[Dict[str, Any]]:
    return _load_json(PLANS_PATH, [])


def _save_plans(plans: List[Dict[str, Any]]) -> None:
    _save_json(PLANS_PATH, plans)


def cmd_save_plan(args: argparse.Namespace) -> None:
    plans = _load_plans()
    if any(plan['name'] == args.plan for plan in plans):
        _print({'error': 'plan_exists', 'plan': args.plan})
        return
    tasks = []
    if args.tasks:
        for raw in args.tasks.split(';'):
            raw = raw.strip()
            if raw:
                tasks.append({'name': raw, 'completed': False})
    plan = {
        'name': args.plan,
        'tasks': tasks,
        'status': 'pending',
        'created': _timestamp(),
        'updated': _timestamp(),
        'notes': args.notes or '',
    }
    plans.append(plan)
    _save_plans(plans)
    _print({'status': 'saved', 'plan': plan})


def cmd_update_plan_progress(args: argparse.Namespace) -> None:
    plans = _load_plans()
    for plan in plans:
        if plan['name'] == args.plan:
            updated = False
            if args.task:
                for task in plan['tasks']:
                    if task['name'] == args.task:
                        task['completed'] = args.is_completed
                        updated = True
                        break
                if not updated:
                    new_task = {'name': args.task, 'completed': args.is_completed}
                    plan['tasks'].append(new_task)
                    updated = True
            else:
                plan['status'] = 'completed' if args.is_completed else 'in_progress'
                updated = True
            if updated:
                plan['updated'] = _timestamp()
                _save_plans(plans)
                _print({'status': 'updated', 'plan': plan})
                return
    _print({'error': 'plan_not_found', 'plan': args.plan})


def cmd_retrieve_active_plans(args: argparse.Namespace) -> None:
    plans = _load_plans()
    active = [plan for plan in plans if plan.get('status') != 'completed']
    _print({'active_plans': active})


def cmd_think_information(args: argparse.Namespace) -> None:
    reflections = _load_json(REFLECTION_PATH, {'thoughts': [], 'assessments': []})
    entry = {
        'notes': args.notes,
        'timestamp': _timestamp(),
    }
    reflections.setdefault('thoughts', []).append(entry)
    _save_json(REFLECTION_PATH, reflections)
    _print({'status': 'recorded', 'entry': entry})


def cmd_assess_context(args: argparse.Namespace) -> None:
    reflections = _load_json(REFLECTION_PATH, {'thoughts': [], 'assessments': []})
    entry = {
        'assessment': args.assessment,
        'timestamp': _timestamp(),
        'confidence': args.confidence,
    }
    reflections.setdefault('assessments', []).append(entry)
    _save_json(REFLECTION_PATH, reflections)
    _print({'status': 'recorded', 'entry': entry})


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description='Local Byterover workflow helper')
    subparsers = parser.add_subparsers(dest='command', required=True)

    sp = subparsers.add_parser('check-handbook-existence')
    sp.set_defaults(func=cmd_check_handbook_existence)

    sp = subparsers.add_parser('create-handbook')
    sp.add_argument('--title', default=None)
    sp.add_argument('--note', default=None)
    sp.set_defaults(func=cmd_create_handbook)

    sp = subparsers.add_parser('check-handbook-sync')
    sp.set_defaults(func=cmd_check_handbook_sync)

    sp = subparsers.add_parser('update-handbook')
    sp.add_argument('--change', default=None)
    sp.add_argument('--apply', action='store_true')
    sp.set_defaults(func=cmd_update_handbook)

    sp = subparsers.add_parser('list-modules')
    sp.set_defaults(func=cmd_list_modules)

    sp = subparsers.add_parser('store-module')
    sp.add_argument('--name', required=True)
    sp.add_argument('--summary', required=True)
    sp.add_argument('--details', default='')
    sp.set_defaults(func=cmd_store_module)

    sp = subparsers.add_parser('update-module')
    sp.add_argument('--name', required=True)
    sp.add_argument('--summary')
    sp.add_argument('--details')
    sp.set_defaults(func=cmd_update_module)

    sp = subparsers.add_parser('search-module')
    sp.add_argument('--query', required=True)
    sp.set_defaults(func=cmd_search_module)

    sp = subparsers.add_parser('store-knowledge')
    sp.add_argument('--topic', required=True)
    sp.add_argument('--content', required=True)
    sp.add_argument('--tags')
    sp.set_defaults(func=cmd_store_knowledge)

    sp = subparsers.add_parser('retrieve-knowledge')
    sp.add_argument('--topic')
    sp.set_defaults(func=cmd_retrieve_knowledge)

    sp = subparsers.add_parser('save-implementation-plan')
    sp.add_argument('--plan', required=True)
    sp.add_argument('--tasks', help='Semicolon separated task list')
    sp.add_argument('--notes')
    sp.set_defaults(func=cmd_save_plan)

    sp = subparsers.add_parser('update-plan-progress')
    sp.add_argument('--plan', required=True)
    sp.add_argument('--task')
    sp.add_argument('--is-completed', required=True, type=lambda v: v.lower() == 'true')
    sp.set_defaults(func=cmd_update_plan_progress)

    sp = subparsers.add_parser('retrieve-active-plans')
    sp.set_defaults(func=cmd_retrieve_active_plans)

    sp = subparsers.add_parser('think-about-collected-information')
    sp.add_argument('--notes', required=True)
    sp.set_defaults(func=cmd_think_information)

    sp = subparsers.add_parser('assess-context-completeness')
    sp.add_argument('--assessment', required=True)
    sp.add_argument('--confidence', type=float, default=0.5)
    sp.set_defaults(func=cmd_assess_context)

    return parser


def main(argv: List[str]) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == '__main__':
    main(sys.argv[1:])
