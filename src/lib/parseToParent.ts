export const postToParent = (message: string) => {
    window.parent.postMessage(message, '*')
  }