import { getPromoSettings, getActiveGeneralPromos, getPromoStats } from '@/app/actions/promo';

export async function GET() {
    try {
        const settings = await getPromoSettings();
        const promoActive = settings.PROMO_ACTIVE || 'false';
        const generalPromos = await getActiveGeneralPromos();
        const stats = await getPromoStats();
        return Response.json({
            promoActive,
            generalPromos,
            limitRemaining: stats.remainingLimit
        });
    } catch (e) {
        console.error('promo API error:', e);
        return Response.json({ promoActive: 'false', generalPromos: [], limitRemaining: 0 });
    }
}
