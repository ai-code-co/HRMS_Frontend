const isLoading = ref(false)

export function useGlobalLoader() {
    function showLoader() {
        isLoading.value = true
    }

    function hideLoader() {
        isLoading.value = false
    }

    return {
        isLoading: readonly(isLoading),
        showLoader,
        hideLoader
    }
}
