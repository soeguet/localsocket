interface HttpLogger {
	logError(error: Error): void;
}

class ErrorLogger implements HttpLogger {
	logError(error: unknown) {
		if (!(error instanceof Error)) {
			errorLogger.logError(
				new Error("Error is not an instance of Error")
			);
			return;
		}

		const time = new Date().toISOString();
		const clientDbId = "Socket";
		const clientUsername = "Socket";

		const errorPayload = {
			title: error.name,
			message: error.message,
			stack: error.stack,
			time: time,
			clientDbId: clientDbId,
			clientUsername: clientUsername,
		};

		try {
			fetch("http://localhost:5588/v1/log/error", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(errorPayload),
			})
				.then((response) => {
					if (!response.ok) {
						// if the request fails, log the error to the console
						console.error(
							"Failed to log error",
							response.statusText
						);
						console.error("Error message: ", error);
					}
				})
				.catch((loggingError) => {
					console.error("Error logging error:", loggingError);
				});
		} catch (loggingError) {
			console.error("Error logging error:", loggingError);
		}
	}
}

const errorLogger = new ErrorLogger();

export { errorLogger };