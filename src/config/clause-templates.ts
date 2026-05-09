import type { ClauseCategory, ClauseTemplate } from "@/types/clause-template";

export const CLAUSE_CATEGORIES: ClauseCategory[] = [
  { id: "management_fee", label: "관리비", icon: "🏢" },
  { id: "repair_responsibility", label: "수선 책임", icon: "🔧" },
  { id: "registration", label: "전입신고", icon: "📋" },
  { id: "noise_living", label: "소음·생활", icon: "🔇" },
  { id: "pet", label: "반려동물", icon: "🐾" },
  { id: "parking", label: "주차", icon: "🚗" },
  { id: "early_termination", label: "중도해지", icon: "📅" },
  { id: "restoration", label: "원상복구", icon: "🔨" },
];

export const CLAUSE_TEMPLATES: ClauseTemplate[] = [
  // ── 관리비 ──────────────────────────────────────────────────
  {
    id: "mf_01",
    categoryId: "management_fee",
    title: "관리비 포함 (공과금 별도)",
    text: "월세에는 관리비가 포함되어 있으며, 전기·가스·수도 등 공과금은 임차인이 별도로 부담한다.",
  },
  {
    id: "mf_02",
    categoryId: "management_fee",
    title: "관리비 별도 (정액제)",
    text: "관리비는 월 ___원으로 정하며, 공과금 실비가 초과할 경우 임차인이 추가 부담한다.",
  },
  {
    id: "mf_03",
    categoryId: "management_fee",
    title: "실비 정산",
    text: "관리비는 전기·가스·수도 요금 및 공동관리비 실비로 매월 정산하여 익월 말일까지 납부한다.",
  },
  {
    id: "mf_04",
    categoryId: "management_fee",
    title: "인터넷·TV 포함",
    text: "인터넷 및 케이블TV 요금은 임대인이 부담하며, 임차인은 별도로 가입·변경할 수 없다.",
  },

  // ── 수선 책임 ────────────────────────────────────────────────
  {
    id: "rr_01",
    categoryId: "repair_responsibility",
    title: "소모품 임차인 부담",
    text: "형광등·전구·필터 등 소모품 교체 및 10만 원 미만의 소수선은 임차인이 부담한다.",
  },
  {
    id: "rr_02",
    categoryId: "repair_responsibility",
    title: "주요 설비 임대인 부담",
    text: "보일러·에어컨·배수 등 주요 설비의 수선은 임차인의 귀책 사유가 없는 한 임대인이 부담한다.",
  },
  {
    id: "rr_03",
    categoryId: "repair_responsibility",
    title: "시설 현상 유지",
    text: "임차인은 현 시설 상태를 유지하며, 임대인 동의 없이 구조 변경·도배·도색 등을 할 수 없다.",
  },
  {
    id: "rr_04",
    categoryId: "repair_responsibility",
    title: "하자 즉시 통보",
    text: "임차인은 누수·결로 등 하자 발생 시 즉시 임대인에게 통보하여야 하며, 미통보로 인한 손해는 임차인이 부담한다.",
  },

  // ── 전입신고 ─────────────────────────────────────────────────
  {
    id: "reg_01",
    categoryId: "registration",
    title: "전입신고 의무",
    text: "임차인은 입주일로부터 14일 이내에 전입신고 및 확정일자를 받아야 하며, 이를 이행하지 않아 발생하는 손해는 임차인이 부담한다.",
  },
  {
    id: "reg_02",
    categoryId: "registration",
    title: "전입신고 금지",
    text: "임차인은 임대인의 서면 동의 없이 해당 주소지로 전입신고를 할 수 없다.",
  },
  {
    id: "reg_03",
    categoryId: "registration",
    title: "확정일자 취득 권고",
    text: "임차인의 보증금 보호를 위해 임대차계약 체결 후 즉시 확정일자를 취득할 것을 권고한다.",
  },

  // ── 소음·생활 ────────────────────────────────────────────────
  {
    id: "nl_01",
    categoryId: "noise_living",
    title: "야간 소음 금지",
    text: "오후 10시~익일 오전 7시 사이에는 TV, 오디오, 악기 연주 등 타 세대에 피해를 주는 소음 행위를 금지한다.",
  },
  {
    id: "nl_02",
    categoryId: "noise_living",
    title: "흡연 금지",
    text: "건물 내부(베란다 포함)에서의 흡연을 전면 금지하며, 위반 시 원상복구 비용 및 손해배상을 청구할 수 있다.",
  },
  {
    id: "nl_03",
    categoryId: "noise_living",
    title: "쓰레기 분리배출",
    text: "쓰레기는 지정 장소에 분리배출하며, 무단 투기 시 발생하는 과태료는 임차인이 부담한다.",
  },
  {
    id: "nl_04",
    categoryId: "noise_living",
    title: "층간소음 준수",
    text: "임차인은 주택법령상 층간소음 기준을 준수해야 하며, 반복적 민원 발생 시 계약을 해지할 수 있다.",
  },

  // ── 반려동물 ─────────────────────────────────────────────────
  {
    id: "pet_01",
    categoryId: "pet",
    title: "반려동물 사육 금지",
    text: "임대인의 서면 동의 없이 반려동물(소형견·고양이 포함)을 사육할 수 없으며, 위반 시 즉시 계약을 해지할 수 있다.",
  },
  {
    id: "pet_02",
    categoryId: "pet",
    title: "반려동물 허용 (조건부)",
    text: "소형 반려동물(10kg 미만) 1마리에 한해 사육을 허용하되, 퇴거 시 반려동물로 인한 손상은 임차인이 전액 원상복구한다.",
  },
  {
    id: "pet_03",
    categoryId: "pet",
    title: "반려동물 추가 보증금",
    text: "반려동물 사육 허용의 대가로 반려동물 보증금 ___원을 별도로 납부하며, 원상복구 후 반환한다.",
  },

  // ── 주차 ─────────────────────────────────────────────────────
  {
    id: "pk_01",
    categoryId: "parking",
    title: "주차 1대 제공",
    text: "임차인에게 주차공간 1대를 제공하며, 추가 차량 주차는 허용하지 않는다.",
  },
  {
    id: "pk_02",
    categoryId: "parking",
    title: "주차 불가",
    text: "해당 건물에는 전용 주차공간이 없으며, 임차인은 인근 유료 주차장을 이용하여야 한다.",
  },
  {
    id: "pk_03",
    categoryId: "parking",
    title: "주차 추가 비용",
    text: "기본 주차 1대 외 추가 차량은 월 ___원의 주차비를 별도로 납부한다.",
  },
  {
    id: "pk_04",
    categoryId: "parking",
    title: "방문객 주차 제한",
    text: "방문객 차량은 당일에 한해 허용하며, 장기 주차는 사전 협의 후 가능하다.",
  },

  // ── 중도해지 ─────────────────────────────────────────────────
  {
    id: "et_01",
    categoryId: "early_termination",
    title: "중도해지 위약금 (임차인 귀책)",
    text: "임차인의 사정으로 계약기간 만료 전 해지 시, 잔여 임대료의 __개월분에 해당하는 위약금을 임대인에게 지급한다.",
  },
  {
    id: "et_02",
    categoryId: "early_termination",
    title: "새 임차인 구인 의무",
    text: "임차인이 중도해지를 요청할 경우 새로운 임차인을 직접 구해 임대인에게 소개하여야 하며, 이를 이행할 때까지 임대료 납부 의무가 지속된다.",
  },
  {
    id: "et_03",
    categoryId: "early_termination",
    title: "6개월 전 통보 의무",
    text: "계약 해지를 원할 경우 최소 6개월 전에 서면으로 통보하여야 하며, 미통보 시 2개월분의 임대료를 위약금으로 지급한다.",
  },
  {
    id: "et_04",
    categoryId: "early_termination",
    title: "중도해지 위약금 없음",
    text: "쌍방 합의에 의한 중도해지의 경우 별도의 위약금을 부담하지 않는다.",
  },

  // ── 원상복구 ─────────────────────────────────────────────────
  {
    id: "rs_01",
    categoryId: "restoration",
    title: "원상복구 원칙",
    text: "임차인은 계약 종료 시 임차 목적물을 계약 체결 당시의 상태로 원상복구하여 임대인에게 인도하여야 한다.",
  },
  {
    id: "rs_02",
    categoryId: "restoration",
    title: "도배·장판 원상복구",
    text: "퇴거 시 도배·장판의 상태가 입주 당시보다 현저히 훼손된 경우, 임차인이 교체 비용을 부담한다. 자연 소모에 의한 경우는 제외한다.",
  },
  {
    id: "rs_03",
    categoryId: "restoration",
    title: "청소 의무",
    text: "퇴거 시 임차인은 전문 청소업체를 통해 청소를 완료한 상태로 인도하여야 하며, 미이행 시 청소 비용을 보증금에서 공제한다.",
  },
  {
    id: "rs_04",
    categoryId: "restoration",
    title: "임차인 설치물 제거",
    text: "임차인이 설치한 에어컨·붙박이 가구 등은 퇴거 전에 철거하고 원상복구하여야 한다. 단, 임대인과 서면으로 합의한 경우 기부채납할 수 있다.",
  },
  {
    id: "rs_05",
    categoryId: "restoration",
    title: "보증금 정산 기한",
    text: "임대인은 원상복구 완료 및 임차 목적물 인도 후 __일 이내에 보증금을 반환한다.",
  },
];
