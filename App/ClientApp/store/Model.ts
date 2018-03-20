export interface AnimalData {
    id: number;
    litterId: number;
    isFemale: boolean;
    hold: boolean;
    sold: boolean;
    description: string;
    pictureUrl: string;
    priceOverride: number;
}

export interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    bankAccount: string;
    description: string;
    pictureUrl: string;
    location: string;
    style: string;
    litters: LitterData[];
}

export interface LitterData {
    id: number;
    userId: number;
    bornOn: string;
    weeksToWean: number;
    price: number;
    deposit: number;
    animal: string;
    breed: string;
    pictureUrl: string;
    description: string;
    listed: string;
    isIndividual: boolean;
    animals: AnimalData[];
    user: UserData;
    available: string;
}
