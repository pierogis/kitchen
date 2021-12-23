// adapted from svelte-material-ui
// https://github.com/hperrin/svelte-material-ui/blob/59e1069f5f56119622e2f4fbfdd4e53f7bde4682/packages/common/src/internal/useActions.ts

export type ActionDescription<T> = {
  action: (
    element: HTMLElement,
    params?: T
  ) => {
    update?: (params?: T) => void;
    destroy?: () => void;
  } | void;
  params?: T;
};

export function useActions(
  node: HTMLElement | SVGElement,
  actions: ActionDescription<any>[]
) {
  let actionHandles: ({
    update?: (params?: any) => void;
    destroy?: () => void;
  } | void)[] = [];

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
      // if actions changes length, destroy the old handles and attach the new ones
      if (((actions && actions.length) || 0) != actionHandles.length) {
        actionHandles.forEach((handle) => {
          if (handle && handle.destroy) {
            handle.destroy();
          }
        });

        actionHandles = [];

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

      // update all of the handles
      if (actions) {
        actions.forEach((action, i) => {
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
    },
  };
}
