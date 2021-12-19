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

export function useAction(element: HTMLElement, action: ActionDescription<any>) {
  let actionHandle = action && action.action(element, action.params);

  return {
    update(params: any) {
      actionHandle && actionHandle.update(params);
    },
    destroy() {
      actionHandle && actionHandle.destroy();
    },
  };
}
