import { NextRequest, NextResponse } from "next/server";
import { matchShoes } from "@/lib/matching-engine";
import { QuizAnswers, Shoe } from "@/lib/types";
import catalog from "@/data/catalog.json";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const answers: QuizAnswers = body.answers;

    if (!answers || !answers.activity) {
      return NextResponse.json({ error: "Missing quiz answers" }, { status: 400 });
    }

    const results = matchShoes(answers, catalog as Shoe[]);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
