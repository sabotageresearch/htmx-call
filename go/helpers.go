package htmx

type FormData struct {
	Values map[string]string `json:"values"`
	Errors []string          `json:"errors"`
}

type HXSwap string

const (
	SwapNone        = HXSwap("none")
	SwapInnerHTML   = HXSwap("innerHTML")
	SwapOuterHTML   = HXSwap("outerHTML")
	SwapBeforeBegin = HXSwap("beforebegin")
	SwapAfterBegin  = HXSwap("afterbegin")
	SwapBeforeEnd   = HXSwap("beforeend")
	SwapAfterEnd    = HXSwap("afterend")
	SwapDelete      = HXSwap("delete")
)

type Result struct {
	HXReswap             HXSwap `json:"hx-reswap"`
	HXRetarget           string `json:"hx-retarget"`
	HXTrigger            string `json:"hx-trigger"`
	HXTriggerAfterSettle string `json:"hx-trigger-after-settle"`
	HXTriggerAfterSwap   string `json:"hx-trigger-after-swap"`
	HXReselect           string `json:"hx-reselect"`
	Content              string `json:"content"`
}
