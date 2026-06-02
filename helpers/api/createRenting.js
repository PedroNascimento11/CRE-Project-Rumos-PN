import { expect } from '@playwright/test';

export async function createRenting(
    request,
    rentingData
) {

    const response = await request.post(
        '/arrendamentos',
        {
            data: rentingData
        }
    );

    expect(
        response.status()
    ).toBe(201);

    return await response.json();
}