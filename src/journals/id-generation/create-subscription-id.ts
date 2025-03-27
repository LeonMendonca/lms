import { Subscription } from "rxjs";

const alphabetArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const numberOfPadding = 5
const paddingZero = ''.padStart(numberOfPadding, '0')

export async function genSubscriptionId(prevId: string | null, type: 'sub_id') {
    try {
        // Fetch the latest subscription_id
        const latestSubscriptionQuery = await this.journalsTitleRepository.query(
            `SELECT subscription_id FROM journal_titles ORDER BY subscription_id DESC LIMIT 1`
        );

        let newSubscriptionId = "sub_id_01"; // Default if no records exist

        if (latestSubscriptionQuery.length > 0) {
            const latestSubscription = latestSubscriptionQuery[0].subscription_id;
            const match = latestSubscription.match(/sub_id_(\d+)/);

            if (match) {
                const latestNumber = parseInt(match[1], 10);
                newSubscriptionId = `sub_id_${String(latestNumber + 1).padStart(2, '0')}`;
            }
        }
        console.log(newSubscriptionId)
    } catch (error) {
        console.error("Error generating subscription_id:", error);
        throw error;
    }
}