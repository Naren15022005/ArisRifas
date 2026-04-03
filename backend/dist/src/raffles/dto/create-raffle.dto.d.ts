export declare class CreateRaffleDto {
    title: string;
    description?: string;
    imageUrl?: string;
    pricePerTicket: number;
    totalTickets: number;
    drawDate: string;
    estimatedValue?: number;
    associatedLottery?: string;
    isPublished?: boolean;
}
