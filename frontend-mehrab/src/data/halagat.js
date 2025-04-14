// Mock data for Halaqat sessions
export const mockData = [
  {
    id: 1,
    title: "حلقة تحفيظ القرآن الكريم",
    description: "حلقة لتحفيظ القرآن الكريم للمبتدئين",
    startTime: "2023-09-01T18:00:00Z",
    endTime: "2023-09-01T20:00:00Z",
    participants: 12,
    maxParticipants: 20,
    sheikh: {
      id: 101,
      name: "الشيخ أحمد محمد",
      expertise: "تحفيظ القرآن",
      avatarUrl: "/images/avatars/sheikh1.jpg"
    },
    status: "active"
  },
  {
    id: 2,
    title: "حلقة تجويد وترتيل",
    description: "حلقة متخصصة في تعليم أحكام التجويد والترتيل الصحيح",
    startTime: "2023-09-02T17:00:00Z",
    endTime: "2023-09-02T19:00:00Z",
    participants: 15,
    maxParticipants: 15,
    sheikh: {
      id: 102,
      name: "الشيخ عبدالله العمري",
      expertise: "علم التجويد",
      avatarUrl: "/images/avatars/sheikh2.jpg"
    },
    status: "full"
  },
  {
    id: 3,
    title: "حلقة حفظ الجزء الثلاثين",
    description: "حلقة مخصصة لحفظ جزء عم بإتقان",
    startTime: "2023-09-03T19:00:00Z",
    endTime: "2023-09-03T21:00:00Z",
    participants: 8,
    maxParticipants: 15,
    sheikh: {
      id: 103,
      name: "الشيخ خالد الزهراني",
      expertise: "تحفيظ وتفسير",
      avatarUrl: "/images/avatars/sheikh3.jpg"
    },
    status: "active"
  },
  {
    id: 4,
    title: "حلقة تفسير آيات الأحكام",
    description: "حلقة متخصصة في تفسير الآيات المتعلقة بالأحكام الشرعية",
    startTime: "2023-09-04T20:00:00Z",
    endTime: "2023-09-04T22:00:00Z",
    participants: 10,
    maxParticipants: 20,
    sheikh: {
      id: 104,
      name: "الشيخ سعد القحطاني",
      expertise: "تفسير وفقه",
      avatarUrl: "/images/avatars/sheikh4.jpg"
    },
    status: "active"
  }
]; 