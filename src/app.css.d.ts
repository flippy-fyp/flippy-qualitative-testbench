declare namespace AppCssNamespace {
    export interface IAppCss {
        lol: string
    }
}

declare const AppCssModule: AppCssNamespace.IAppCss & {
    /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
    locals: AppCssNamespace.IAppCss
}

export = AppCssModule
