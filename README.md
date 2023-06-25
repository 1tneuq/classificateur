# Projet Classificateur

## Description générale du projet

Réalisation d'un outil web permettant de classifier les élèves de la promotion en fonction de votes réalisés au préalable.


## Algorithme de classification utilisé:

```
But: calculer  le vecteur p_n contenant les probabilités auxquelles chaque élève est associé.

P Plus n est grand, plus p_n est précis.
p_0 est un vecteur (1/N, 1/N, ..., 1/N), où N est le nombre d'élèves.
Pour obtenir le vecteur p_(n + 1), p_ (n + 1), on fait p_n * M, où M est une matrice avec les coefficients a_ij et où i et j sont les logins des étudiants.

Calcul a_ij: -si i ne vote pour personne, alors a_ij = 1 / N ; avec N le nombre d'élèves,
             -sinon, a_ij = (nb de votes de i vers j) / (nb de votes total de i).

On fixe la valeur de l'ordre à 250.

Enfin, Brin et Pages est utilisée pour diluer la matrice de pondération des votes et la valeur alpha est fixée à 0,15.
```


## Contributeurs

- Aurélien MONPIERRE
- Quentin LACOMBE
