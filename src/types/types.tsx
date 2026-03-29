export type CallbackFunction = (...args: any[]) => void;

export interface ActionObject {
    func?: (params?: any) => Promise<void> | void;
    args?: any[];
}

export interface SOARData {
    id: number;
    name: string;
    type: string;
    url: string;
    apiKey: string;
    isTarget: boolean;
}

export interface SIEMConfigFile {
    filename: string;
    content?: string;
    file?: File | null;
    hashDigest?: string;
}

export interface SIEMData {
    id: number;
    name: string;
    type: string;
    url: string;
    useAPIKey: boolean;
    authType: string;
    apiKey?: string;
    username?: string;
    password?: string;
    isTarget: boolean;
    configFiles?: SIEMConfigFile[];
}

export interface TargetSOARInfo {
    id: string;
}

export interface TargetSIEMInfo {
    id: string;
}

export interface OrganizationData {
    id: string;
    name: string;
    description: string;
}

export interface CaseData {
    id: string;
    title: string;
    description: string;
    tlp: number;
    pap: number;
}

export interface CaseDataForest {
    id: string;
    label: string;
    title?: string;
    description?: string;
    children?: CaseDataForest[];
}

export interface TaskData {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    createdBy: string;
    group: string;
    status: string;
}

export interface TaskLogData {
    id: string;
    message: string;
    createdAt: Date;
    createdBy: string;
}

export interface ObservableData {
    id: string;
    type: string,
    createdBy: string;
    createdAt: Date;
    dataType: string;
    data: string;
    startDate: Date;
    tlp: number;
    pap: number;
    ioc: boolean;
    reports: any;
}

export interface DocumentData {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    createdBy: string;
    category: string;
}