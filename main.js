console.log("votes :");console.log(votes);
console.log("logins :");console.log(logins);

// Tableau du nom des matières
let subjects = getSubjects(votes);

// Ordre n auquel calculer par récursivité le vecteur de scores
let degree = 250;

 // Valeur alpha de formule de Brin et Pages
let alpha = 0.15;

// Ajoute les checkboxes qui permettent à l'utilisateur de selectionner les matières à partir desquelles sera fait le classement
addCheckboxes(subjects);

// Quand le bouton est cliqué, les résultats sont calculés à partir des votes
document.getElementById('calcul-btn').onclick = () => refreshResults(votes, logins, subjects, degree, alpha);//displayAll(rank(votes, logins, subjects, 100));


// Calcule et affiche le classement.
refreshResults(votes, logins, subjects, degree, alpha);


// Fonction qui renvoie un tableau contenant les matières à utiliser pour la classification
function getSubjects(votes) {
	let subjects = [];

	for (const login in votes) {
		if (votes.hasOwnProperty(login)) {
			const votesRow = votes[login];
			for (const subject in votesRow) {
				if (votesRow.hasOwnProperty(subject)) {
					subjects.push(subject);
				}
			}

			break;
		}
	}

	return subjects;
}

// Fonction pour ajouter les checkboxes au html
function addCheckboxes(subjects) {
	let slidersContainer = document.getElementById('checkboxes');
	slidersContainer.innerHTML = '';

	subjects.forEach(subject => addCheckbox(slidersContainer, subject));
}

// Fonction ajoute dans l'élément HTML donné une checkbox qui permet à l'utilisateur de choisir les matières
function addCheckbox(container, subject) {
	let rowContainer = createElement('div', 'checkbox-container');

	let label = createElement('label', 'checkbox-label', subject + ": ");
	label.for = subject;
	rowContainer.appendChild(label);

	let input = createElement('input', 'checkbox focusable');
	input.type = 'checkbox';
	input.id = subject + '-checkbox';
	input.name = subject;
	input.value = 0;
	input.oninput = () =>  updateRangeText(subject);
	rowContainer.appendChild(input);

	let output = createElement('span', 'checkbox-output', getCheckboxValue(input));
	output.id = subject + '-checkbox-output';
	rowContainer.appendChild(output);

	container.appendChild(rowContainer);
}

// Fonction qui met à jour le texte dans l'élément qui permet de voir la valeur du checkbox qui correspond à la matière donnée.
function updateRangeText(subject) {
	let input = document.getElementById(subject + '-checkbox');
	let output = document.getElementById(subject + '-checkbox-output');
	output.innerHTML = getCheckboxValue(input);
}

// Fonction qui renvoie un objet de la forme { matiere_1: X_1, matiere_2: X_2, ... } où matiere_i est le nom d'une matière dans le tableau donné en argument et X_i est le coefficient des votes dans cette matière.
// Si le checkbox pour matiere_i a une valeur de x_i, alors X_i = (2^x_i) - 1.
function getSubjectWeights(subjects) {
	let weights = {};

	subjects.forEach( subject => {
		let value = document.getElementById(subject + '-checkbox').value;

		weights[subject] = (1 << parseInt(value, 10)) - 1;
	});

	return weights;
}

// La fonction appelée quand les scores de chaque élève doivent être calculés et affichés.
// Un nouveau thread est créé pour les calculs. Quand les calculs sont terminés, le thread
// renvoie les scores triés, qui sont ajoutés dans le HTML.
function refreshResults(votes, logins, subjects, degree, alpha = 0.0) {
	let container = document.getElementById('results');
	if(container == undefined)
		alert('No element with id "results".');
	container.innerHTML = 'Calcul en cours...';

	if (window.Worker) {
		let prWorker = new Worker('pagerank_worker.js');
		prWorker.onmessage = function(e) {
			console.log('Main received msg from prWorker :'); console.log(e.data);
			console.log('e.origin : '); console.log(e.origin);

			// Afficher les résultats reçus du thread créé.
			showAll(e.data, container);

			console.log('Terminating prWorker.');
			prWorker.terminate();
		}

		// Envoyer les données nécessaires pour commencer la classification
		prWorker.postMessage({
			votes: votes,
			logins: logins,
			subjectWeights: getSubjectWeights(subjects),
			degree: degree,
			alpha: alpha
		});
	}
}

// Fonction qui affiche le classement donné dans l'élément donné.
function showAll(ranks, container) {
	container.innerHTML = '';

	let rankProbability = 2.0;
	let rank = 0;
	for (let i = 0; i < ranks.length; i++) {
		const person = ranks[i];
		if (person.probability < rankProbability) {
			rank++;
			rankProbability = person.probability;
		}
		show(rank, person, container);
	}
}

// Fonction qui ajoute dans l'élément donné une nouvelle ligne qui a le rang donné et dont le nom, login
function show( rank, listItem, container ) {
	let div = createElement('div', 'list-item');

	div.appendChild(createElement('span', 'rank', rank));
	div.appendChild(createElement('span', 'name', listItem.name));
	div.appendChild(createElement('span', 'login', listItem.login));
	container.appendChild(div);
}

// Crée un élément HTML.
function createElement(type, className = '', innerHTML = '') {
	let element = document.createElement(type);
	element.className = className;
	element.innerHTML = innerHTML;
	return element;
}

//Fonction qui renvoie si la checkbox est cochée ou non
function getCheckboxValue(input) {
	if (input.checked == true) {
		input.value = 1;
	} else {
		input.value = 0;
	}
}
