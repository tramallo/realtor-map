const nominatimApiUrl = "https://nominatim.openstreetmap.org/search";

export const requestAddressInfo = async (address: string) => {
    const searchParams = new URLSearchParams({
        q: address
    }).toString();

    const searchUrl = `${nominatimApiUrl}?${searchParams}`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Reponse non-2XX - ${response}`)
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Content type not supported - ${response}`);
        }

        const responseBody = await response.json();
        return responseBody;

    } catch (error) {
        console.log(error);
    }

}