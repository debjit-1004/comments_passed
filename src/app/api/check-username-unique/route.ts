import dbconnect from "@/lib/dbConnect";
import { z } from "zod";
import User from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const usernamequeryschema = z.object({
    username: usernameValidation
});

export async function GET(request: NextRequest) {
    await dbconnect();
    try {
        const { searchParams } = new URL(request.url);
        const queryparam = {
            username: searchParams.get("username")
        };

        // Validate with ZOD
        const result = usernamequeryschema.safeParse(queryparam);
        console.log(result);
        console.log('zod error', result.error?.errors.map(err => err.message).join(', '), "zod error end");
        
        if (!result.success) {
            const usernameerrors = result.error?.errors.map(err => err.message).join(', ');
            console.log('username errors', usernameerrors); 
            return NextResponse.json({ success: false, message: usernameerrors }, { status: 200 });
        }

        const { username } = result.data;
        // Fix the field name from isverified to isVerified (case sensitive)
        const existingverifieduser = await User.findOne({ username: username, isVerified: true });
        
        if (existingverifieduser) {
            return NextResponse.json({ success: false, message: "Username already exists" }, { status: 200 });
        } else {
            return NextResponse.json({ success: true, message: "Username is available" }, { status: 200 });
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ 
                success: false, 
                message: "Error checking username", 
                error: error.message 
            }, { status: 500 });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: "An unknown error occurred" 
            }, { status: 500 });
        }
    }
}