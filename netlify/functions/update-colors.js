const axios = require("axios");
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
}

const updateColors = async event => {
	const body = JSON.parse(event.body);
	const {
		content,
		repository_branch,
		repository_owner,
		repository_name,
		file_path,
	} = body;

	try {
		const getFileResponse = await axios.get(
			`https://api.github.com/repos/${repository_owner}/${repository_name}/contents/${file_path}?ref=${repository_branch}`,
			{ headers: { Authorization: `token ${GITHUB_TOKEN}` } }
		);

		const sha = getFileResponse.data.sha;

		await axios.put(
			`https://api.github.com/repos/${repository_owner}/${repository_name}/contents/${file_path}?ref=${repository_branch}`,
			{
				message: "Actualizar colores desde Figma",
				content: Buffer.from(JSON.stringify(content)).toString("base64"),
				sha,
			},
			{ headers: { Authorization: `token ${GITHUB_TOKEN}` } }
		);

		return {
			headers,
			statusCode: 200,
			body: "Colores actualizados correctamente.",
		}
	} catch (error) {
		console.error(error.message);
		return {
			headers,
			statusCode: 500,
			body: "Error al actualizar los colores.",
		}
	}
}

exports.handler = async (event, context) => {
	try {
		const httpMethod = event.httpMethod;

		switch (httpMethod) {
			case 'POST':
				return await updateColors(event, context);
			default:
				return {
					headers,
					statusCode: 405,
					body: 'Method Not Allowed',
				};
		}

	} catch {
		return {
			headers,
			statusCode: 500,
			body: 'Internal Server Error',
		}
	}
}