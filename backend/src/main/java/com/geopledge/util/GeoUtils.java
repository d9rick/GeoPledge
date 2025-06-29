package com.geopledge.util;

public final class GeoUtils {
    private static final double R = 6_371_000;           // earth radius (m)

    private GeoUtils() {}

    /** Great-circle distance in metres (Haversine). */
    public static double haversine(double lat1, double lon1,
                                   double lat2, double lon2) {

        double phi1 = Math.toRadians(lat1), phi2 = Math.toRadians(lat2);
        double delta_phi = Math.toRadians(lat2 - lat1);
        double delta_lambda = Math.toRadians(lon2 - lon1);

        double a = Math.pow(Math.sin(delta_phi / 2), 2)
                + Math.cos(phi1) * Math.cos(phi2)
                * Math.pow(Math.sin(delta_lambda / 2), 2);

        return 2 * R * Math.asin(Math.sqrt(a));
    }
}
