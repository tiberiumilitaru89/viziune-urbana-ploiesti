import { NextResponse } from "next/server";
import { z } from "zod";
import { addDonation } from "@/lib/data";

const donationSchema = z.object({
  type: z.enum(["bani", "materiale"]),
  targetAssociationName: z.string().optional(),
  amountRon: z.number().optional(),
  materialType: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  companyOrName: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = donationSchema.parse(body);

    const saved = addDonation({
      type: validated.type,
      targetAssociationName: validated.targetAssociationName,
      amountRon: validated.amountRon,
      materialType: validated.materialType,
      quantity: validated.quantity,
      unit: validated.unit,
      companyOrName: validated.companyOrName,
      phone: validated.phone,
      email: validated.email,
    });

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Eroare internă de server." }, { status: 500 });
  }
}
