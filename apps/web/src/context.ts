import { createContext } from "@lit/context";
import { type CalculatorInfo } from "./calculator";

/** Calculator context. */
export const calculatorContext = createContext<CalculatorInfo | undefined>("calculator");
