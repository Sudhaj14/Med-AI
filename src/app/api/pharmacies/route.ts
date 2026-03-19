import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pharmacy from '@/lib/models/Pharmacy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const pincode = searchParams.get('pincode');
    const medicine = searchParams.get('medicine');

    await connectDB();

    let query: any = { isActive: true };

    // Search by medicine name
    if (medicine) {
      query['medicines.name'] = { $regex: medicine, $options: 'i' };
    }

    // Filter by city
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by pincode
    if (pincode) {
      query['address.pincode'] = pincode;
    }

    // General search (pharmacy name, medicine name)
    if (search && !medicine) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { 'medicines.name': { $regex: search, $options: 'i' } },
      ];
    }

    const pharmacies = await Pharmacy.find(query)
      .select('name address phone rating operatingHours medicines')
      .lean();

    // If searching for specific medicine, filter and sort by availability
    if (medicine) {
      const pharmaciesWithMedicine = pharmacies
        .map(pharmacy => {
          const medicineData = pharmacy.medicines.find((med: any) => 
            med.name.toLowerCase().includes(medicine.toLowerCase())
          );
          
          if (medicineData) {
            return {
              ...pharmacy,
              availableMedicine: medicineData,
              distance: calculateDistance(
                0, 0, // User coordinates (should come from request)
                pharmacy.address.coordinates?.latitude || 0,
                pharmacy.address.coordinates?.longitude || 0
              )
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.distance - b.distance);

      return NextResponse.json({ pharmacies: pharmaciesWithMedicine });
    }

    return NextResponse.json({ pharmacies });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pharmacies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const pharmacyData = await request.json();

    await connectDB();

    const pharmacy = new Pharmacy(pharmacyData);
    await pharmacy.save();

    return NextResponse.json({ 
      success: true, 
      pharmacy,
      message: 'Pharmacy registered successfully!' 
    });
  } catch (error) {
    console.error('Error registering pharmacy:', error);
    return NextResponse.json(
      { error: 'Failed to register pharmacy' },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
