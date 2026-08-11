/**
 * Anti-bruteforce très simple pour le formulaire de connexion.
 *
 * Compteur en mémoire (Map), par email tenté : au-delà de MAX_TENTATIVES
 * échecs dans la FENETRE_MS, les tentatives suivantes sont bloquées jusqu'à
 * expiration de la fenêtre.
 *
 * Limite connue et assumée : ce compteur vit dans la mémoire du process
 * Node.js. Il est remis à zéro à chaque redémarrage du serveur, et ne serait
 * plus suffisant si l'application tournait un jour sur plusieurs instances
 * en parallèle (il faudrait alors un stockage partagé, ex. Redis).
 */

const MAX_TENTATIVES = 5;
const FENETRE_MS = 15 * 60 * 1000; // 15 minutes

interface Entree {
	nombreEchecs: number;
	depuis: number;
}

const tentativesParCle = new Map<string, Entree>();

function entreeExpiree(entree: Entree): boolean {
	return Date.now() - entree.depuis > FENETRE_MS;
}

/** true si la clé (ex. un email) a dépassé le nombre d'échecs autorisés sur la fenêtre en cours. */
export function estBloque(cle: string): boolean {
	const entree = tentativesParCle.get(cle);
	if (!entree || entreeExpiree(entree)) return false;
	return entree.nombreEchecs >= MAX_TENTATIVES;
}

/** À appeler après un échec d'authentification pour cette clé. */
export function enregistrerEchec(cle: string): void {
	const entree = tentativesParCle.get(cle);
	if (!entree || entreeExpiree(entree)) {
		tentativesParCle.set(cle, { nombreEchecs: 1, depuis: Date.now() });
		return;
	}
	entree.nombreEchecs += 1;
}

/** À appeler après une authentification réussie pour cette clé. */
export function reinitialiser(cle: string): void {
	tentativesParCle.delete(cle);
}
