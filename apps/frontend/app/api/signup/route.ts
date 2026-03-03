import { NextRequest, NextResponse } from "next/server";
import { prismaclient } from "@repo/db/client";
import { signupSchema } from "@repo/zod";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate input with Zod
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password, name } = validationResult.data;

    // Check if user already exists
    const existingUser = await prismaclient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 },
      );
    }

    // Hash password with bcrypt (salt rounds: 12 for production)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const user = await prismaclient.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        photo: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An error occurred while creating your account",
      },
      { status: 500 },
    );
  }
}
