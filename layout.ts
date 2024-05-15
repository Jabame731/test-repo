            <ups-layouts-layout
            [layout]="logNextStepLayout$ | async"
            [sections]="nextStepAction() === 'NoFollowup' ? noFollowUpSelected() : logTesting()"
            [fields]="logTest()"
            [formVals]="nextActionForm.form.value"
            [editingSettings]="false"
            [aggregateType]="aggregateType"
          ></ups-layouts-layout>


import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  FieldEntity,
  FieldsUsecase,
  LayoutStoreEntity,
  LayoutsUsecase,
  RecordsUsecase,
  RecordTypeEntity,
  SectionEntity,
  SectionsUsecase,
  Uuid,
} from '@ups-layouts';
import { AppointmentDateComponent } from '../../components';
import {
  AccountAttributes,
  Activity,
  AddEmailAddressUsecase,
  AddPhoneNumberUsecase,
  AddressPayload,
  ChangeStatusUsecase,
  ContactAttributes,
  ContactId,
  ContactStatus,
  EmailAddressPayload,
  GetUptapeUsecase,
  PdfFollowupSheetUsecase,
  PhoneNumberPayload,
  ValidateAddressUsecase,
} from '@ups-crm-store';
import { ToggleItem } from '@ups-lib';
import { GetTodosUsecase, TodoItem } from '@ups-todo-store';
import {
  FieldService,
  PhoneService,
  ToggleQualificationUsecase,
} from '@ups-mfe-shell-commons';
import { FeatureFlagUsecase, GetUsersUsecase } from '@ups-users-store';
import { isAfter } from 'date-fns';
import { toSignal } from '@angular/core/rxjs-interop';
import { GetTokenUsecase } from '@ups-auth-store';

@Component({
  selector: 'crm-contact-base',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactBaseComponent implements OnInit {
  protected layoutsUsecase = inject(LayoutsUsecase);
  protected sectionsUsecase = inject(SectionsUsecase);
  protected fieldsUsecase = inject(FieldsUsecase);
  protected getUptape = inject(GetUptapeUsecase);
  protected getTodosUsecase = inject(GetTodosUsecase);
  protected toggleQualificationUsecase = inject(ToggleQualificationUsecase);
  protected recordsUsecase = inject(RecordsUsecase);
  protected addPhoneNumberUsecase = inject(AddPhoneNumberUsecase);
  protected addEmailAddressUsecase = inject(AddEmailAddressUsecase);
  protected validateAddressUsecase = inject(ValidateAddressUsecase);
  protected changeStatusUsecase = inject(ChangeStatusUsecase);
  protected getUsersUsecase = inject(GetUsersUsecase);
  protected featureFlagUsecase = inject(FeatureFlagUsecase);
  protected phoneService = inject(PhoneService);
  private getAccessToken = inject(GetTokenUsecase);
  private pdfFollowupSheetUsecase = inject(PdfFollowupSheetUsecase);
  private fieldService = inject(FieldService);

  source: string;
  aggregateType: string;
  accessToken: string;

  currentBase$: Observable<AccountAttributes | ContactAttributes>;

  records$: Observable<RecordTypeEntity[]>;

  nextStepAction = toSignal(this.fieldService.nextStepAction$);

  logNextStepLayout$: Observable<LayoutStoreEntity> =
    this.layoutsUsecase.findLayoutByEventNameAndFormName({
      eventName: 'NextStepLogged',
      formName: 'NextStepLoggedForm',
    });

  logNextStepSections$: Observable<SectionEntity[]> =
    this.logNextStepLayout$.pipe(
      filter((layout) => !!layout && !!layout.attributes),
      switchMap((layout: LayoutStoreEntity) => {
        // if (this.nextStepAction() === 'NoFollowup') {
        //   console.log(layout.attributes.sections);
        // }

        console.log(layout);

        return this.sectionsUsecase.getSections(layout.attributes.sections);
      })
    );

  logNextStepSectionsz$: Observable<SectionEntity[]> =
    this.logNextStepLayout$.pipe(
      filter((layout) => !!layout && !!layout.attributes),
      switchMap((layout: LayoutStoreEntity) => {
        const filteredSection = layout.attributes.sections.filter(
          (id) => id !== '2a93bb96-a0fa-4dd7-b83e-5f3a8f2a1cfd'
        );

        return this.sectionsUsecase.getSections(filteredSection);
      })
    );

  // noFollowUpSelected$: Observable<FieldEntity | undefined> = combineLatest([
  //   this.logNextStepLayout$,
  //   this.fieldsUsecase.getAllFields(),
  // ]).pipe(
  //   filter(([layout]) => !!layout && !!layout.attributes),
  //   map(([layout, allfields]) => {

  //     const nextStepActionAndReason = allfields.find(
  //       (field) =>
  //         (field.layoutId === layout.id && field.propId === 'nextStepAction') ||
  //         (field.layoutId === layout.id && field.propId === 'nextStepReason')
  //     );
  //     return nextStepActionAndReason;
  //   })
  // );

  noFollowUpSelected$: Observable<{
    nextStepAction: FieldEntity | undefined;
    nextStepDate: FieldEntity | undefined;
  }> = combineLatest([
    this.logNextStepLayout$,
    this.fieldsUsecase.getAllFields(),
  ]).pipe(
    filter(([layout]) => !!layout && !!layout.attributes),
    map(([layout, allfields]) => {
      const nextStepAction = allfields.find(
        (field) =>
          field.layoutId === layout.id && field.propId === 'nextStepAction'
      );
      const nextStepDate = allfields.find(
        (field) =>
          field.layoutId === layout.id && field.propId === 'nextStepReason'
      );

      return { nextStepAction, nextStepDate };
    })
  );

  logTesting = toSignal(this.logNextStepSections$);
  noFollowUpSelected = toSignal(this.logNextStepSectionsz$);

  logTest = computed(() => {
    if (this.nextStepAction() === 'NoFollowup') {
      return this.logNextStepFieldsz();
    } else {
      return this.logNextStepSections();
    }
  });

  logNextStepFields$: Observable<Map<Uuid, Map<number, FieldEntity[]>>> =
    this.logNextStepLayout$.pipe(
      filter((layout) => !!layout && !!layout.attributes),
      switchMap((layout) => {
        return this.sectionsUsecase
          .getSectionColumnMap(layout.attributes.sections)
          .pipe(
            filter((startingMap) => startingMap.size > 0),
            switchMap((startingMap) => {
              return this.fieldsUsecase.getFieldsKeyedBySectionIdAndColumn(
                startingMap,
                layout.attributes.layoutFields,
                layout.id
              );
            }),
            map((sections) => {
              const newMap: Map<string, Map<number, FieldEntity[]>> = new Map();
              sections.forEach((columns, sectionId) => {
                let colMap: Map<number, FieldEntity[]>;
                if (!newMap.has(sectionId)) {
                  colMap = new Map<number, FieldEntity[]>();
                  newMap.set(sectionId, colMap);
                }
                columns.forEach((fields, col) => {
                  if (!colMap.has(col)) {
                    colMap.set(
                      col,
                      fields.reduce((acc, widget) => {
                        const copy = { ...widget };

                        if (copy.propId === 'nextStepDate') {
                          copy.componentAddOn = {
                            component: AppointmentDateComponent,
                            data: null,
                          };
                        }
                        return [...acc, copy];
                      }, [])
                    );
                  }
                });
              });
              return newMap;
            })
          );
      })
    );

  logNextStepFieldsz$: Observable<Map<Uuid, Map<number, FieldEntity[]>>> =
    this.logNextStepLayout$.pipe(
      filter((layout) => !!layout && !!layout.attributes),
      switchMap((layout) => {
        console.log(layout.attributes.sections);

        return this.sectionsUsecase
          .getSectionColumnMap(layout.attributes.sections)
          .pipe(
            filter((startingMap) => startingMap.size > 0),
            switchMap((startingMap) => {
              console.log(startingMap);

              console.log(layout.id);

              // Filter out converStationType and nextStepDate from layoutFields
              const filteredLayoutFields =
                layout.attributes.layoutFields.filter(
                  (field) =>
                    field !== 'conversationType' && field !== 'nextStepDate'
                );

              return this.fieldsUsecase.getFieldsKeyedBySectionIdAndColumn(
                startingMap,
                filteredLayoutFields,
                layout.id
              );
            })
          );
      })
    );

  logNextStepSections = toSignal(this.logNextStepFields$);
  logNextStepFieldsz = toSignal(this.logNextStepFieldsz$);

  initialUpAndTapeId$ = new BehaviorSubject<{
    uptapeId: string;
    claimId: string;
  }>(null);

  progressionLabels$: Observable<{ [id: string]: string }> =
    this.initialUpAndTapeId$.pipe(
      filter((upInfo) => !!upInfo && !!upInfo.uptapeId && !!upInfo.claimId),
      switchMap((upInfo) => this.getUptape.getUptapeStepLabels(upInfo.uptapeId))
    );

  upInfo$ = this.initialUpAndTapeId$.pipe(
    filter((upInfo) => !!upInfo && !!upInfo.uptapeId && !!upInfo.claimId),
    switchMap((upInfo) => {
      return this.getUptape.uptapeIsLoaded(upInfo.uptapeId).pipe(
        tap((loaded) => {
          if (!loaded) {
            this.getUptape.getUptape(upInfo.uptapeId);
          }
        }),
        filter((loaded) => loaded),
        take(1),
        switchMap(() =>
          this.getUptape.upFromUptape(upInfo.uptapeId, upInfo.claimId)
        )
      );
    })
  );

  progression$: Observable<ToggleItem[]> = combineLatest([
    this.upInfo$,
    this.progressionLabels$,
  ]).pipe(
    filter(
      ([upInfo, progressionLabel]) =>
        !!upInfo && !!upInfo.progressed && !!progressionLabel
    ),
    map(([upInfo, progressionLabel]) => {
      const {
        progressed: { steps },
      } = upInfo;
      return Object.keys(progressionLabel).reduce((acc, curr) => {
        const item: ToggleItem = {
          id: curr,
          label: progressionLabel[curr],
          value: typeof steps[curr] !== 'undefined' ? steps[curr] : false,
          hasMany: false,
          locked: true,
        };
        return [...acc, item];
      }, []);
    })
  );

  upInfoLoading$ = this.initialUpAndTapeId$.pipe(
    filter((upInfo) => !!upInfo && !!upInfo.uptapeId && !!upInfo.claimId),
    switchMap((upInfo) => this.getUptape.uptapeIsLoading(upInfo.uptapeId))
  );

  orderedTodos: TodoItem[];

  todos$ = new BehaviorSubject<TodoItem[]>([]);

  ts$ = this.getTodosUsecase.todos$.pipe(
    tap((x: TodoItem[]) => {
      this.orderedTodos = [...x];
      this.todos$.next(x);
    })
  );

  activities$: Observable<Activity[]>;

  upcomingAppointmentActivities$: Observable<Activity[]>;

  featureFlags$ = this.featureFlagUsecase.featureFlags$;

  phoneAppAvailable: Signal<boolean> = toSignal(
    this.featureFlags$.pipe(map((features) => features?.['phone-sms']))
  );

  ngOnInit(): void {
    this.records$ = this.recordsUsecase.getAllRecordsOfType(this.aggregateType);
    this.activities$ = this.buildActivities();
    this.upcomingAppointmentActivities$ =
      this.buildUpcomingAppointmentActivities();

    this.getAccessToken
      .execute()
      ?.pipe(take(1))
      .subscribe((token) => {
        this.accessToken = token;
      });

    this.logNextStepFields$.subscribe((data) => {
      console.log('lognextStepfield', data);
    });
  }

  buildActivities(): Observable<Activity[]> {
    return this.currentBase$.pipe(
      filter(
        (contact) =>
          !!contact && !!contact.activities && contact.activities.length > 0
      ),
      map((contact) =>
        [...contact.activities].sort((a: any, b: any) => {
          const aDate = a.activityAt || (<any>a).activityDate!;
          const bDate = b.activityAt || (<any>b).activityDate!;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        })
      ),
      map((activities) => {
        return activities.map((activity: Activity) => {
          let username,
            transferredFrom,
            transferredTo = '';
          this.getUsersUsecase
            .getUserFullName(activity.addedBy)
            .pipe(take(1))
            .subscribe((name) => {
              username = name;
            });

          if (activity.type === 'Up' && !!activity.upTapeId) {
            this.initialUpAndTapeId$.next({
              uptapeId: activity.upTapeId,
              claimId: activity.claimId,
            });
          }

          if (activity.type === 'Transfer') {
            this.getUsersUsecase
              .getUserFullName(activity.oldAssignedTo)
              .pipe(take(1))
              .subscribe((name) => {
                transferredFrom = name;
              });
            this.getUsersUsecase
              .getUserFullName(activity.newAssignedTo)
              .pipe(take(1))
              .subscribe((name) => {
                transferredTo = name;
              });
          }

          return Object.keys(activity).reduce((acc, curr) => {
            if (curr === 'fieldData') {
              return {
                ...acc,
                ...activity[curr],
              };
            }
            return {
              ...acc,
              [curr]: activity[curr],
              conversationType: `${activity.hadConversation ? 'Yes' : 'No'}__${
                activity.type
              }`,
              name: username,
              transferredFrom,
              transferredTo,
            };
          }, {}) as Activity;
        });
      })
    );
  }

  buildUpcomingAppointmentActivities(): Observable<Activity[]> {
    return this.activities$.pipe(
      filter((a) => !!a),
      map((activities) => {
        return activities.filter((a) => {
          return (
            a.nextStepAction === 'Appointment' &&
            isAfter(new Date(a.nextStepDate), new Date())
          );
        });
      }),
      map((activities) =>
        activities.sort((a, b) =>
          isAfter(new Date(a.nextStepDate), new Date(b.nextStepDate)) ? 1 : -1
        )
      )
    );
  }

  handleStatusChanged({
    id,
    currentStatus,
  }: {
    id: ContactId;
    currentStatus: ContactStatus;
  }) {
    this.changeStatusUsecase.execute(id, currentStatus, this.source);
  }

  handleAddPhoneNumber({
    contactId,
    phoneNumberPayload,
  }: {
    contactId: ContactId;
    phoneNumberPayload: PhoneNumberPayload;
  }) {
    this.addPhoneNumberUsecase.execute(
      contactId,
      phoneNumberPayload,
      this.source
    );
  }

  handleAddEmailAddress({
    contactId,
    emailAddressPayload,
  }: {
    contactId: ContactId;
    emailAddressPayload: EmailAddressPayload;
  }) {
    this.addEmailAddressUsecase.execute(
      contactId,
      emailAddressPayload,
      this.source
    );
  }

  handleAddAddress({
    contactId,
    addressPayload,
  }: {
    contactId: ContactId;
    addressPayload: AddressPayload;
  }) {
    this.validateAddressUsecase.execute(contactId, this.source, addressPayload);
  }

  handlePrint(contactId: string) {
    this.pdfFollowupSheetUsecase.execute(contactId, this.accessToken);
  }
}





  constructor(
    private container: ViewContainerRef,
    private fieldsService: FieldsService,
    private nextStepActionService: FieldService
  ) {}

  ngOnChanges() {
    if (this.componentRef) {
      this.applyChanges();
    }

    const nextStepAction = this.formVals?.nextStepAction;

    this.nextStepActionService.getNextStepAction(nextStepAction);
  }





import { ComponentRef, Injectable } from '@angular/core';

import { BehaviorSubject, Observable, filter, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  nextStepAction$ = new BehaviorSubject('');

  getNextStepAction(action) {
    this.nextStepAction$.next(action);
  }
}
