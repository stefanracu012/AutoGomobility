import { prisma } from "@/lib/prisma";
import { calculateTotal } from "@/lib/utils/calc";
import { generateToken } from "@/lib/utils/token";
import { BookingStatus } from "@prisma/client";

export interface Extra {
  label: string;
  price: number;
}

// ── Types ────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  passengers?: number;
  notes?: string;
  pickup: string;
  destination: string;
  vehicle?: string;
  date?: string;
  time?: string;
  basePrice?: number;
}

// ── Create ───────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  const token = generateToken();
  const driverToken = generateToken();

  const basePrice = input.basePrice ?? 0;

  return prisma.booking.create({
    data: {
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      passengers: input.passengers ?? 1,
      notes: input.notes ?? null,
      pickup: input.pickup,
      destination: input.destination,
      vehicle: input.vehicle ?? "business",
      date: input.date ?? null,
      time: input.time ?? null,
      basePrice,
      extras: [],
      totalPrice: basePrice,
      status: BookingStatus.PENDING,
      token,
      driverToken,
    },
  });
}

// ── Read ─────────────────────────────────────────────────────────────

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({ where: { id } });
}

export async function getBookingByToken(token: string) {
  return prisma.booking.findUnique({ where: { token } });
}

// ── Update vehicle ───────────────────────────────────────────────────

export async function updateVehicle(id: string, vehicle: string) {
  return prisma.booking.update({
    where: { id },
    data: { vehicle },
  });
}

// ── Set base price ───────────────────────────────────────────────────

export async function setBasePrice(id: string, price: number) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  const totalPrice = calculateTotal(price, booking.extras as Extra[]);

  return prisma.booking.update({
    where: { id },
    data: { basePrice: price, totalPrice },
  });
}

// ── Extras ───────────────────────────────────────────────────────────

export async function addExtra(id: string, label: string, price: number) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  const extras = [...(booking.extras as Extra[]), { label, price }];
  const totalPrice = calculateTotal(booking.basePrice, extras);

  return prisma.booking.update({
    where: { id },
    data: { extras, totalPrice },
  });
}

export async function removeExtra(id: string, index: number) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  const extras = (booking.extras as Extra[]).filter((_, i) => i !== index);
  const totalPrice = calculateTotal(booking.basePrice, extras);

  return prisma.booking.update({
    where: { id },
    data: { extras, totalPrice },
  });
}

// ── Status transitions ──────────────────────────────────────────────

export async function markOfferSent(id: string, telegramMessageId?: number) {
  return prisma.booking.update({
    where: { id },
    data: {
      status: BookingStatus.OFFER_SENT,
      ...(telegramMessageId !== undefined && { telegramMessageId }),
    },
  });
}

export async function confirmBooking(token: string) {
  return prisma.booking.update({
    where: { token },
    data: { status: BookingStatus.CONFIRMED },
  });
}

export async function rejectBooking(token: string) {
  return prisma.booking.update({
    where: { token },
    data: { status: BookingStatus.REJECTED },
  });
}

export async function cancelBooking(id: string) {
  return prisma.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED },
  });
}

// ── Save Telegram message ID ─────────────────────────────────────────

export async function setTelegramMessageId(id: string, messageId: number) {
  return prisma.booking.update({
    where: { id },
    data: { telegramMessageId: messageId },
  });
}

// ── Driver location tracking ─────────────────────────────────────────

export async function getBookingByDriverToken(driverToken: string) {
  return prisma.booking.findUnique({ where: { driverToken } });
}

export async function updateDriverLocation(
  driverToken: string,
  lat: number,
  lon: number,
) {
  return prisma.booking.update({
    where: { driverToken },
    data: { driverLat: lat, driverLon: lon, driverOnline: true },
  });
}

export async function setDriverOffline(driverToken: string) {
  return prisma.booking.update({
    where: { driverToken },
    data: { driverOnline: false },
  });
}
