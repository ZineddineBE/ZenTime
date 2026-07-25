import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** Le client n'est créé qu'au premier appel (au moment d'une vraie requête),
 * pas au chargement du fichier — sinon le build Next.js plante en CI, où
 * STRIPE_SECRET_KEY n'existe pas (et ne doit pas exister au build). */
export function getStripe(): Stripe {
	if (!stripeClient) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY manquante dans les variables d'environnement");
		}
		stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
	}
	return stripeClient;
}
