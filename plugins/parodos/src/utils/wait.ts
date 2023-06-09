export const waitForElement = <E extends HTMLElement>(
  selector: string,
  breakAt: number = 10,
  delay = 100,
): Promise<E> => {
  return new Promise<E>((resolve, reject) => {
    const wait = (count = 0) => {
      const el = document.querySelector(selector);

      if (!!el) {
        resolve(el as E);
      } else {
        setTimeout(() => {
          if (count < breakAt) {
            wait(count + 1);
          } else {
            reject(new Error(`no element found for ${selector}`));
          }
        }, delay);
      }
    };

    wait();
  });
};
