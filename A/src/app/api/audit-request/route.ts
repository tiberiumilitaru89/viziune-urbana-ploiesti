import { NextResponse } from "next/server";
import { z } from "zod";
import { saveAssociation } from "@/lib/db";

const requestSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  building: z.string().min(3),
  address: z.string().min(5),
  problem: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const id = `req-${Date.now()}`;

    const saved = await saveAssociation({
      id,
      name: validated.name,
      phone: validated.phone,
      building: validated.building,
      address: validated.address,
      problem: validated.problem,
      status: "nou",
      formsCollected: 0,
      formsTarget: 40,
      fundsCollected: 0,
      fundsTarget: 12000,
      createdAt: new Date().toISOString(),
    });

    if (!saved) {
      return NextResponse.json({ success: false, message: "Eroare la salvare în baza de date" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Eroare internă de server." }, { status: 500 });
  }
}
