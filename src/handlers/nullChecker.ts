/**
 * wrapper function for objectChecker
 * @param T - object to check
 * @param fields - number of fields the object should have
 * @returns boolean
 */
export function objectChecker(T: object, fields: number) {

    const isObjectNull = isNotNull(T);

    if (isObjectNull) {
        return true;
    }

    // const objectHasTooManyFields = hasTooManyFields(T, fields);
    //
    // if (objectHasTooManyFields) {
    //     return true;
    // }
    //
    // const objectHasTooFewFields = hasTooFewFields(T, fields);
    //
    // if (objectHasTooFewFields) {
    //     return true;
    // }

    return false;
}

/**
 * Check if any part of the object is null
* @param obj - object to check
* @returns boolean
*/
export function isNotNull<T extends object>(obj: T): boolean {
    return !Object.values(obj).some(value => value === null || value === undefined);
}

/**
* Check if the object has too many fields
* @param obj - object to check
* @param maxFields - maximum number of fields allowed
* @returns boolean
*/
export function hasTooManyFields<T extends object>(obj: T, maxFields: number): boolean {
    return Object.keys(obj).length > maxFields;
}

/**
* Check if the object has too few fields
* @param obj - object to check
* @param minFields - minimum number of fields allowed
* @returns boolean
*/
export function hasTooFewFields<T extends object>(obj: T, minFields: number): boolean {
    return Object.keys(obj).length < minFields;
}
