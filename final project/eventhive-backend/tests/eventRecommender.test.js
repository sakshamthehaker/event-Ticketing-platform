const { getRecommendedEvents } = require("../src/utils/eventRecommender");

describe("event recommender", () => {
  it("returns the most similar events from the same cluster first", () => {
    const events = [
      {
        _id: "1",
        title: "AI Workshop",
        description: "Hands-on machine learning and data science",
        location: "Innovation Lab",
        date: "2026-04-10T10:00:00.000Z",
        price: 499,
        totalSeats: 80
      },
      {
        _id: "2",
        title: "ML Bootcamp",
        description: "Machine learning projects and practical AI sessions",
        location: "Innovation Center",
        date: "2026-04-12T10:00:00.000Z",
        price: 549,
        totalSeats: 90
      },
      {
        _id: "3",
        title: "Startup Pitch Day",
        description: "Business ideas and investor networking",
        location: "Main Auditorium",
        date: "2026-06-01T10:00:00.000Z",
        price: 150,
        totalSeats: 300
      },
      {
        _id: "4",
        title: "Deep Learning Meetup",
        description: "Neural networks, AI demos, and model evaluation",
        location: "Innovation Lab",
        date: "2026-04-15T10:00:00.000Z",
        price: 520,
        totalSeats: 85
      }
    ];

    const recommendations = getRecommendedEvents(events, "1", 2);

    expect(recommendations).toHaveLength(2);
    expect(recommendations.map((event) => event._id)).toEqual(["4", "2"]);
    expect(recommendations[0].recommendationScore).toBeGreaterThan(recommendations[1].recommendationScore);
  });
});
