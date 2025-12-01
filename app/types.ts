export interface Student {
    id: string;
    name: string;
    groupId: string;
    photo: string;
    percentage: number;
}

export interface Group {
    id: string;
    name: string;
    cr: string | null;
}

export interface Settings {
    starThresholds: number[];
}

export interface AppData {
    groups: Group[];
    students: Student[];
    settings: Settings;
}

export interface StudentWithRank extends Student {
    rank: number;
    isCR: boolean;
    groupName: string;
}
