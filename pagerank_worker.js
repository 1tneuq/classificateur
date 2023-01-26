// Fonction pour repondere a main.js avec les scores de chaque étudiant triés par ordre décroissant
onmessage = function(e) {
	postMessage(rank(e.data));
}

// Fonction qui trie le tableau d'abord par ordre décroissant de probailité, puis par ordre alphabétique et renvoie un tableau d'objets de type {login: xxx, name: xxx, probability: xxx}.
function rank(data) {
	let votes = data.votes;
	let logins = data.logins;
	let subjectWeights = data.subjectWeights;
	let degree = data.degree;
	let alpha = data.alpha;

	let nbLogins = 0;
	for (const login in logins) {
		if (logins.hasOwnProperty(login)) {
			nbLogins++;
		}
	}
	console.log("nbLogins : "+nbLogins);
	console.log('subject weights :');console.log(subjectWeights);
	console.log('alpha : '+alpha);

	let matrix = createMatrix(votes, logins, nbLogins, subjectWeights, alpha);
	console.log("matrix :"); console.log(matrix);

	let probabilities = getProbabilities(matrix, logins, degree, nbLogins);

	probabilities.sort(higherProbability);
	console.log("sorted probabilities :"); console.log(probabilities);


	let totalProbability = 0.0;
	probabilities.forEach(value => totalProbability += value.probability);
	console.log("total probability : "+totalProbability);

	return probabilities;
}

// Fonction qui envoie une matrice de coefficients a_ij ou i et j sont des logins.
function createMatrix(votes, logins, nbLogins, subjectWeights, alpha = 0.0) {
	let matrix = {};
	let voterCount = 0;

	for (const login in logins) {
		let hasAnyVotes = addRow(login, matrix, votes, logins, nbLogins, subjectWeights, alpha);

		if (hasAnyVotes) voterCount++;
	}

	console.log("Voter count : " + voterCount);

	return matrix;
}

// Fonction qui calcule le vecteur de scores p_(degree) grâce à la récursivité et renvoie un tableau [ {login: xxx, name: xxx, probability: xxx}, ... ]
function getProbabilities(matrix, logins, degree, nbLogins) {
	let probabilities =  [];
	if (degree === 0) { // Si on calcule à l'ordre 0, les probabilités valent toutes 1 / nbLogins
		let probabilityValue = 1.0 / nbLogins;
		for (const login in logins) {
			if (logins.hasOwnProperty(login)) {
				probabilities.push({
					login: login,
					name: logins[login],
					probability: probabilityValue
				});

			}
		}
	} else {
		probabilities = multiplyMatrix(getProbabilities(matrix, logins, degree - 1, nbLogins), matrix);
	}

	return probabilities;
}

function addRow(rowLogin, matrix, votes, logins, nbLogins, subjectWeights, alpha) {
	let hasAnyVotes = false;
	let probability;
	let matrixRow = {};
	let votesRow = votes[rowLogin];

	// la probabilité à utiliser pour chaque login si l'élève ne vote pas
	let defaultProbability = 1.0 / nbLogins;


	if (votesRow === null) {
		votesRow = {};
	}

	for (const columnLogin in logins) {
		if (logins.hasOwnProperty(columnLogin)) {
			probability = getProbabilityTo(rowLogin, columnLogin, votesRow, logins, nbLogins, defaultProbability, subjectWeights, alpha);
			matrixRow[columnLogin] = probability;

			if ( ! hasAnyVotes
				&& probability != defaultProbability) {

				hasAnyVotes = true;
			}
		}
	}

	matrix[rowLogin] = matrixRow;

	return hasAnyVotes;
}

// Fonction qui calcule et renvoie le coefficient de la matrice dont la ligne est rowLogin et la colonne est columnLogin.
function getProbabilityTo(rowLogin, columnLogin, votesRow, logins, nbLogins, defaultProbability, subjectWeights, alpha) {
	let votesForColumn = 0;
	let totalVotes = 0;

	for (const subject in votesRow) {
		totalVotes += votesRow[subject].length * subjectWeights[subject];
		let votedForColumn = votesRow[subject].includes(columnLogin);
		let votedForThemselves = votesRow[subject].includes(rowLogin);

		if (rowLogin != columnLogin && votedForColumn) {
			votesForColumn += subjectWeights[subject];
		}
		if (votedForThemselves) {
			totalVotes -= subjectWeights[subject];

		}
	}

	let probability;
	if (totalVotes === 0)
		probability = defaultProbability;
	else {
		probability =  votesForColumn * 1.0 / totalVotes;
		let brinPagesProbability = ((1.0 - alpha) * probability) + (alpha * 1.0 / nbLogins);
		probability = brinPagesProbability
	}

	return probability;
}

// Fonction qui multiplie un vecteur ligne de probabilités par la matrice donnée.
function multiplyMatrix(probabilities, matrix) {
	// [ {login: xxx, name: xxx, probability: xxx}, ... ]
	let newProbabilities = [];

	probabilities.forEach(value => {
		let newProbability = {
			login: value.login,
			name: value.name,
			probability: multiplyRowColumn(probabilities, getColumn(value.login, matrix) )
		};
		newProbabilities.push(newProbability);
	});

	return newProbabilities;
}

// Fonction qui multplie un vecteur ligne par une colonne de la matrice.
function multiplyRowColumn(row, column) {
	let res = 0.0;

	row.forEach(element => {
		res += element.probability * 1.0 * column[element.login];
	})

	return res;
}

// Fonction qui renvoie un objet qui représente la colonne de la matrice donnée correspondant au login donné.
function getColumn(columnLogin, matrix) {
	let column = {};

	for (const rowLogin in matrix) {
		column[rowLogin] = matrix[rowLogin][columnLogin];
	}

	return column;
}

// Fonction qui compare les deux objets de la forme {login: xxx, name: xxx, probability: xxx}, en triant d'abord en ordre décroissant de probabilité, puis si nécessaire par ordre alphabétique de login.
function higherProbability(a, b) {
	if (a.probability == b.probability) {
		return a.login.localeCompare(b.login, 'fr');
	}

	return b.probability - a.probability;
}
