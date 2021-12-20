// adapted from svelte-material-ui
// https://github.com/hperrin/svelte-material-ui/blob/59e1069f5f56119622e2f4fbfdd4e53f7bde4682/packages/common/src/internal/useActions.ts

export type ActionDescription<T> = {
  action: (
    element: HTMLElement,
    params?: T
  ) => {
    update?: (params?: T) => void;
    destroy?: () => void;
  };
  params?: T;
};

export function useActions(
  node: HTMLElement | SVGElement,
  actions: ActionDescription<any>[]
) {
  let actionHandles: {
    update?: (params?: any) => void;
    destroy?: () => void;
  }[] = [];

  if (actions) {
    actions.forEach((action: ActionDescription<any>, i: number) => {
      if (action.params) {
        actionHandles.push(
          action.action(node as HTMLElement & SVGElement, action.params)
        );
      } else {
        actionHandles.push(action.action(node as HTMLElement & SVGElement));
      }
    });
  }

  return {
    update(actions: ActionDescription<any>[]) {
      if (((actions && actions.length) || 0) != actionHandles.length) {
        throw new Error("You must not change the length of an actions array.");
      }

      if (actions) {
        actions.forEach((action, i) => {
          let handle = actionHandles[i];
          if (handle && handle.update) {
            let action = actions[i];
            if (Array.isArray(action) && action.length > 1) {
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
    },
  };
}
