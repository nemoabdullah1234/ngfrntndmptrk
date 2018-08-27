export interface EmployeeLocator {
    id: string;
    Username: string;
    name: string;
    sensors: any;
    location: any;
    device: any;
    devicetrackings: any;
    trackedAt: string;
}

export interface EmployeeLocatorModel {
    code: number;
    message: string;
    description: string;
    totalRecords: number;
    recordsCount: number;
    data: EmployeeLocator[];
}

export interface EmployeeLocatorHistory {
    user: any;
    sensors: any;
    location: any;
    trackedAt: string;
}

export interface EmployeeLocatorHistoryModel {
    code: number;
    message: string;
    description: string;
    totalRecords: number;
    recordsCount: number;
    data: EmployeeLocatorHistory[];
}

export interface UserEntrance {
    id: string;
    location: any;
    user: any;
    interval: number;
    firstIn: string;
    lastOut: string;
    dt: string;
    type: string;
}

export interface UserEntranceModel {
    code: number;
    message: string;
    description: string;
    totalRecords: number;
    recordsCount: number;
    data: UserEntrance[];
}


export interface LoginHistory {
    id: string;
    loginTime: any;
    logoutTime: any;
    device: any;
    user: any;
    sensor: any;
}

export interface LoginHistoryModel {
    code: number;
    message: string;
    description: string;
    totalRecords: number;
    recordsCount: number;
    data: LoginHistory[];
}

