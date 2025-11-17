export type TMayBeArray<T> = T | Array<T>;
export type TBool = 1 | 0;
export type TAltitudeMode = "clampToGround" | "relativeToGround" | "absolute";

export interface IDocument {
    name: string;
    description: string;

    Style?: TMayBeArray<IStyle>;

    Folder?: TMayBeArray<IFolder>;

    Placemark?: TMayBeArray<IPlacemark>;
}

export interface IStyle {
    $id?: string;

    /**
     * 图标样式
     */
    IconStyle?: {
        /**
         * 图标颜色
         */
        color?: string;

        /**
         * 缩放比例
         */
        scale?: number;

        /**
         * 旋转角度
         */
        heading?: number;

        /**
         * 图标
         */
        Icon?: {
            href?: string;
            refreshMode?: string;
            refreshInterval?: number;
        }

        /**
         * 热点
         */
        hotSpot?: {

        }
    };

    /**
     * 标签样式
     */
    LabelStyle?: {
        /**
         * 标签文字颜色
         */
        color?: string;

        /**
         * 标签缩放比例，0=隐藏标签
         */
        scale?: number;

        /**
         * 颜色模式
         */
        colorMode?: "normal" | "random"
    };

    /**
     * 线样式
     */
    LineStyle?: {
        /**
         * 线条颜色
         */
        color?: string;

        /**
         * 线条宽度（像素）
         */
        width?: number;

        /**
         * 颜色模式（normal/random）
         */
        colorMode?: "normal" | "random";

        /**
         * 标签可见性
         */
        "gx:labelVisibility"?: TBool;
    };

    /** 
     * 多边形样式
     */
    PolyStyle?: {
        /**
         * 填充颜色
         */
        color?: string;

        /**
         * 是否填充
         */
        fill?: TBool;

        /**
         * 是否显示边框
         */
        outline?: TBool;

        /**
         * 颜色模式
         */
        colorMode?: "normal" | "random";
    };

    /**
     * 气泡样式
     */
    BalloonStyle?: {
        /**
         * 背景色
         */
        bgColor?: string;

        /**
         * 文字颜色
         */
        textColor?: string;

        /**
         * 气泡内容HTML模板
         */
        text?: string;

        /**
         * 显示模式
         */
        displayMode?: "default" | "hide";
    };

    /**
     * 列表样式
     */
    ListStyle?: {
        /**
         * 列表项类型
         */
        listItemType?: "check" | "radio";

        /**
         * 背景颜色
         */
        bgColor?: string;

        /**
         * 列表图标
         */
        ItemIcon?: {}

    };
}

export interface IFolder {
    name: string;
    "Folder": TMayBeArray<IFolder> | undefined;
    "Placemark": TMayBeArray<IPlacemark> | undefined;
}

export interface IPlacemark {
    name?: string;
    description?: string | {
        "__cdata"?: string;
    };

    styleUrl?: string;
    Style?: IStyle;

    Point?: TMayBeArray<IPoint>;
    LineString?: TMayBeArray<ILineString>;
    Polygon?: TMayBeArray<IPolygon>;
}



export interface ILinearRing {
    coordinates: string;
}

export interface IBoundary{
    LinearRing: ILinearRing;
}

export interface IPoint {
    extrude?: TBool;
    altitudeMode?: TAltitudeMode;
    coordinates: string;
}

export interface ILineString {
    extrude?: TBool;
    altitudeMode?: TAltitudeMode;
    tessellate?: TBool;
    coordinates: string;
}

export interface IPolygon {
    extrude?: TBool;
    altitudeMode?: TAltitudeMode;
    outerBoundaryIs: IBoundary;
    innerBoundaryIs?: TMayBeArray<IBoundary>;
}