import type { UsernameObject, RegisteredUser } from "../customTypes";
import { registerUser, getAllUsers } from "../userRegister";

export async function handleRegisterUserPostRequest(req:Request, headers:Bun.HeadersInit): Promise<Response> {
    return req
        .json()
        .then(async (data) => {
            console.log("data: " + data);
            const dataAsObject: UsernameObject = data as UsernameObject;

            await registerUser(dataAsObject.id, dataAsObject.username);

            const arrayOfAllRegisteredUsers: RegisteredUser[] = getAllUsers();
            const allRegisteredUsersArrayAsString = JSON.stringify(
                arrayOfAllRegisteredUsers
            );

            console.log(allRegisteredUsersArrayAsString);

            return new Response(allRegisteredUsersArrayAsString, {
                status: 200,
                headers,
            });
        })
        .catch((error) => {
            const body = JSON.stringify({ status: "error", message: error.message, });
            const init = { status: 400, headers };
            return new Response( body, init);
        });
}
