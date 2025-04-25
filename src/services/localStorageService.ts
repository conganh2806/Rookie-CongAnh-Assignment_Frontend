class LocalStorageService {
    private static instance: LocalStorageService

    private ACCESS_TOKEN_KEY = 'access_token'
    private REFRESH_TOKEN_KEY = 'refresh_token'

    static getService(): LocalStorageService {
        if (!LocalStorageService.instance) {
        LocalStorageService.instance = new LocalStorageService()
        }
        return LocalStorageService.instance
    }

    setToken(tokenObj: { accessToken: string; refreshToken: string }) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenObj.accessToken)
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenObj.refreshToken)
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY)
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    }

    clearToken() {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY)
        localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    }
}

export default LocalStorageService