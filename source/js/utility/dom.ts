/**
 *  DOM helper functions.
 */

export const findParentByClassname = (element: any, classname: string): any => {
  while(element && !element.classList.contains(classname)) {
    element = element.parentElement
  }
  return element
}
