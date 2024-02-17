import type { UsernameObject, RegisteredUser } from "../customTypes";
import { registerUser, getAllUsers } from "../userRegister";

export async function handleRegisterUserPostRequest(
    req: Request,
    headers: HeadersInit
): Promise<Response> {
    return req
        .json()
        .then(async (data) => {
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
            const arrayOfAllRegisteredUsers: RegisteredUser[] = getAllUsers();
            const allRegisteredUsersArrayAsString = JSON.stringify(
                arrayOfAllRegisteredUsers
            );
            const body = allRegisteredUsersArrayAsString;
            console.log("error: " + error.message);
            console.log(body);
            const init = { status: 202, headers };
            return new Response(body, init);
        });
}
