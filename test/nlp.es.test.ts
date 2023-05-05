import { expect } from 'chai'
import { RRule } from '../src'
import { optionsToString } from '../src/optionstostring'
import { DateFormatter } from '../src/nlp/totext'
import { datetime } from './lib/utils'
import { SPANISH } from '../src/nlp/i18n.es'

const texts = [
  ['Cada día', 'RRULE:FREQ=DAILY'],
  ['Cada día los 10, 12 y 17', 'RRULE:FREQ=DAILY;BYHOUR=10,12,17'],
  ['Cada semana', 'RRULE:FREQ=WEEKLY'],
  ['Cada hora', 'RRULE:FREQ=HOURLY'],
  ['Cada 4 horas', 'RRULE:INTERVAL=4;FREQ=HOURLY'],
  ['Cada semana los martes', 'RRULE:FREQ=WEEKLY;BYDAY=TU'],
  ['Cada semana los lunes, miércoles', 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE'],
  ['Cada día de semana', 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
  ['Cada 2 semanas', 'RRULE:INTERVAL=2;FREQ=WEEKLY'],
  ['Cada mes', 'RRULE:FREQ=MONTHLY'],
  ['Cada 6 meses', 'RRULE:INTERVAL=6;FREQ=MONTHLY'],
  ['Cada año', 'RRULE:FREQ=YEARLY'],
  ['Cada año en el 1º viernes', 'RRULE:FREQ=YEARLY;BYDAY=+1FR'],
  ['Cada año en el 13º viernes', 'RRULE:FREQ=YEARLY;BYDAY=+13FR'],
  ['Cada mes en el 4º', 'RRULE:FREQ=MONTHLY;BYMONTHDAY=4'],
  ['Cada mes en el 4º último', 'RRULE:FREQ=MONTHLY;BYMONTHDAY=-4'],
  ['Cada mes en el 3º martes', 'RRULE:FREQ=MONTHLY;BYDAY=+3TU'],
  ['Cada mes en el 3º último martes', 'RRULE:FREQ=MONTHLY;BYDAY=-3TU'],
  ['Cada mes en el último lunes', 'RRULE:FREQ=MONTHLY;BYDAY=-1MO'],
  ['Cada mes en el 2º último viernes', 'RRULE:FREQ=MONTHLY;BYDAY=-2FR'],
  ['Cada semana por 20 veces', 'RRULE:FREQ=WEEKLY;COUNT=20'],
]

describe('NLP - es la', () => {
  it('fromText()', function () {
    texts.forEach(function (item) {
      const text = item[0]
      const str = item[1]
      expect(RRule.fromText(text, SPANISH).toString()).equals(
        str,
        text + ' => ' + str
      )
    })
  })

  it('toText()', function () {
    texts.forEach(function (item) {
      const text = item[0]
      const str = item[1]
      expect(RRule.fromString(str).toText(SPANISH).toLowerCase()).equals(
        text.toLowerCase(),
        str + ' => ' + text
      )
    })
  })

  it('parseText()', function () {
    texts.forEach(function (item) {
      const text = item[0]
      const str = item[1]
      expect(optionsToString(RRule.parseText(text, SPANISH))).equals(
        str,
        text + ' => ' + str
      )
    })
  })

  it('permits integers in byweekday (#153)', () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: 0,
    })

    expect(rrule.toText(SPANISH)).to.equal('cada semana los lunes')
    expect(rrule.toString()).to.equal('RRULE:FREQ=WEEKLY;BYDAY=MO')
  })

  it('sorts monthdays correctly (#101)', () => {
    const options = { freq: 2, bymonthday: [3, 10, 17, 24] }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal(
      'cada semana en el 3º, 10º, 17º y 24º'
    )
  })

  it('shows correct text for every day', () => {
    const options = {
      freq: RRule.WEEKLY,
      byweekday: [
        RRule.MO,
        RRule.TU,
        RRule.WE,
        RRule.TH,
        RRule.FR,
        RRule.SA,
        RRule.SU,
      ],
    }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal('cada día')
  })

  it('shows correct text for some days', () => {
    const options = {
      freq: RRule.WEEKLY,
      byweekday: [RRule.MO, RRule.WE, RRule.FR],
    }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal(
      'cada semana los lunes, miércoles, viernes'
    )
  })

  it('shows correct text for every minute', () => {
    const options = { freq: RRule.MINUTELY }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal('cada minuto')
  })

  it('shows correct text for every (plural) minutes', () => {
    const options = { freq: RRule.MINUTELY, interval: 2 }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal('cada 2 minutos')
  })

  it('shows correct text for every week', () => {
    const options = { freq: RRule.WEEKLY, interval: 1 }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal('cada semana')
  })

  it('shows correct text for every week (plurar)', () => {
    const options = { freq: RRule.WEEKLY, interval: 2 }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal('cada 2 semanas')
  })

  it('shows correct text for every week, some days', () => {
    const options = {
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday: [RRule.MO, RRule.TU],
    }
    const rule = new RRule(options)
    expect(rule.toText(SPANISH)).to.equal('cada semana los lunes, martes')
  })

  it("by default formats 'until' correctly", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      until: datetime(2012, 11, 10),
    })

    expect(rrule.toText(SPANISH)).to.equal(
      'cada semana hasta noviembre 10, 2012'
    )
  })

  it("formats 'until' as desired if asked", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      until: datetime(2012, 11, 10),
    })

    const dateFormatter: DateFormatter = (year, month, day) =>
      `${day} de ${month} del ${year}`

    expect(rrule.toText(SPANISH, dateFormatter)).to.equal(
      'cada semana hasta 10 de noviembre del 2012'
    )
  })
})
